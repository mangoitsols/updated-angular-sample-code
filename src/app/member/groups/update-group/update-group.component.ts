import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';
declare var $: any;

@Component({
  selector: 'app-update-group',
  templateUrl: './update-group.component.html',
  styleUrls: ['./update-group.component.css']
})
export class UpdateGroupComponent implements OnInit {
  language;
  submitted = false;
  userDetails;
  receiveData:any = [];
  groupData;
  groupid;
  createGroupForm: FormGroup;
  groupParticipant = [];
  showParticipants = false;
  participant = [];
  user_dropdown = [];
  participantSelectedItem = [];
  participantSelectedToShow = [];
  participantDropdownSettings: any ={};
  participantList = [];
  responseMessage = null;
  user_Photo: any;
  alluserInformation = [];
  thumb: JSON;

  constructor(
    private authService: AuthServiceService,
    public formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private lang: LanguageService
    ) {
      this.getUsers();
    }

    editorConfig: AngularEditorConfig = {
      editable: true,
      spellcheck: true,
      minHeight: '5rem',
      maxHeight: '15rem',
      translate: 'no',
      sanitize: true,
      toolbarPosition: 'top',
      defaultFontName: 'Arial',
      defaultFontSize: '2',
      defaultParagraphSeparator: 'p',
      toolbarHiddenButtons: [
        [
          'link',
          'unlink',
          'subscript',
          'superscript',
          'insertUnorderedList',
          'insertHorizontalRule',
          'removeFormat',
          'toggleEditorMode',
          'insertImage',
          'insertVideo'
        ]
      ]
    };

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' + this.userDetails.member_id, null)
    .subscribe(
      (respData: any) => {
        this.user_Photo = respData
      });
    
    this.route.params.subscribe(params => {
      this.groupid = params['groupId'];
      this.setGroupData(this.groupid);
      setTimeout(function(){
        $('.trigger_class').trigger('click');
      }, 3000);
    });

    this.participantDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'user_name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText:this.language.header.search
    };

    this.createGroupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9ä\ö\ü\Ä\Ö\Ü\]+( [a-zA-Z0-9ä\ö\ü\Ä\Ö\Ü\]+)*$")]],
      description: ['', Validators.required],
      add_image: ["null"],
      created_by: [localStorage.getItem('user-id')],
      team_id: [1],
      approved_status: [''],
      participants: ['', Validators.required]
    });
  }

  errorImage: any = { isError: false, errorMessage: '' };
  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];    
    const mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.errorImage = {
        isError: true, errorMessage: this.language.error_message.common_valid
      };      
    }
    else{
      this.errorImage = { Error: true, errorMessage: ''};
      this.createGroupForm.patchValue({
        add_image: file,        
      });     
      this.createGroupForm.get('add_image').updateValueAndValidity();
    }
    const reader = new FileReader();
    var imagePath = file;
    var url;
    let self = this;
    reader.readAsDataURL(file);    
    reader.onload = (_event) => {
      url = reader.result;
      const canvas = document.createElement("canvas");
				const imgHeight =canvas.height;
				const imgWidth = canvas.width;
	
				if((imgHeight >=1000 && imgHeight <= 1100) && (imgWidth >=1000 && imgWidth <=1100 )){
          if(this.groupData.image){
            $('#preview_img').attr('src', url);
          }else{
            $('.preview_img').attr('src', url);
          } 
				}
				else{
					self.errorImage = { isError: true, errorMessage: '"width and Height Shoud be in 1080px * 1080px"' };
				}
       
    }
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);
  }

  onCancel() {
    window.history.back();
  }

  getUsers() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
        .subscribe(
          (respData: any) => {
            console.log(respData);
            
            Object(respData).forEach((val, key) => {
             console.log(
              this.alluserInformation[val.id] = { member_id: val.member_id});
              });
            
            this.authService.setLoader(false);
            this.receiveData = respData;
            Object(respData).forEach((val, key) => {
              if (val.id != localStorage.getItem('user-id')) {
                this.participant.push({
                  'id': val.id,
                  'user_email': val.email,
                  'user_name': val.firstname + " " + val.lastname + " (" + val.email + " )"
                });
                this.user_dropdown.push({
                  'id': val.id,
                  'user_email': val.email,
                  'user_name': val.firstname + " " + val.lastname + " (" + val.email + " )"
                });
              }
            });
          }
        );
    }
  }

  onParticipantSelect(item: any) {
    this.showParticipants = true;
    this.participantSelectedToShow.push(item);
    this.participantSelectedItem.push(item.id);
  }

  onParticipantDeSelect(item: any) {
    this.participantSelectedToShow.forEach((value, index) => {
      if (value.id == item.id) {
        this.participantSelectedToShow.splice(index, 1);
      }
    });
    this.participantSelectedItem.forEach((value, index) => {
      if (value == item.id) {
        this.participantSelectedItem.splice(index, 1);
      }
    });
  }

  updateGroup() {
    this.submitted = true;
    if ((sessionStorage.getItem('token')) && (this.createGroupForm.valid) && (!this.errorImage.isError)) {
      let userRole = this.userDetails.roles[0];
      let status = 0;
      if (userRole == 'admin'){
        status = 1;
      }
      this.participantSelectedItem.forEach((value, index) => {
        this.participantList.push({
          'user_id' : value,
          'approved_status' :status
        })
      });
      if(this.participantList.length){
        var user_id = parseInt(localStorage.getItem('user-id'));
        this.participantList.push({
          'user_id' : user_id,
          'approved_status' : 1
        });
        this.createGroupForm.get('participants').setValue(this.participantList);
      }

      this.authService.setLoader(true);     
      var formData: any = new FormData();
      for (const key in this.createGroupForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.createGroupForm.value, key)) {
          const element = this.createGroupForm.value[key];
          if(key=='add_image'){
            formData.append('file', element);
          }
          if(key=='participants'){
            var userArr : any = [];
            element.forEach(function(value, key){
              var status = 0;
              if (value.user_id == localStorage.getItem('user-id')) {
                status = 1;
              }
              else{
                status = 0;
              }
              var userObj = { 'user_id': value.user_id, 'approved_status': status };
              userArr.push(userObj);
            });
            formData.append("participants", JSON.stringify(userArr));
          }
          else{
            if(key!='add_image')
              formData.append(key, element);
          }
        }
      }
      this.authService.memberSendRequest('put', 'updateGroup/'+this.groupid, formData)
        .subscribe(
          (respData) => {
            this.authService.setLoader(false);
            if(respData['isError'] == false){
              this.responseMessage = respData['result']['message'];
              this.createGroupForm.reset();
              this.submitted = false;
              this.showParticipants = false;
              var url = 'assets/img/event_upload.png';
              $('.preview_img').attr('src', url);
              $('.preview_txt').hide();
              $('.preview_txt').text('');
              var self = this;
              var redirectUrl = 'group-detail/'+this.groupid;
              setTimeout(function(){ 
                self.router.navigate([redirectUrl]);
              },1000); 
            }
            if(respData['code'] == 400){
              this.responseMessage = respData['message'];
            }
          }
        );
    }
  }

  setGroupData(group_id) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'approvedGroupUsers/group/'+group_id, null)
        .subscribe(
          (respData: any) => {
            console.log(respData);
            
            this.authService.setLoader(false);
            this.groupData = respData[0];

            if(this.groupData.participants.length){
              this.groupData.participants.forEach((val, key) => {
                let participant_id = val.user_id;
                this.receiveData.forEach((value, key) => {
                  if ((value.id == participant_id) && (value.id != localStorage.getItem('user-id'))) {
                    this.groupParticipant.push({
                      'id': value.id,
                      'user_email': value.email,
                      'user_name': value.firstname + " " + value.lastname + " (" + value.email + " )"
                    });
                    this.participantSelectedItem.push(value.id);
                    this.participantSelectedToShow.push({
                      'id': value.id,
                      'user_name': value.firstname + " " + value.lastname + " (" + value.email + " )"
                    });
                    console.log(this.participantSelectedToShow);
                    
                    Object(this.participantSelectedToShow).forEach((val, key) => {
											
                      if(this.alluserInformation[val.id].member_id != null){
                      this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' +this.alluserInformation[val.id].member_id, null)
                      .subscribe(
                      (resppData: JSON) => {
                        // console.log(resppData);
                        this.thumb = resppData;
                        val.image = this.thumb;  
                      });
                      }else{
                      val.image = null;
                      }
                    
                });	
                console.log(this.participantSelectedToShow);
                
                    
                  }
                });
              });
              this.showParticipants = true;              
              if(this.groupData){
                this.createGroupForm.controls['name'].setValue(this.groupData.name);
                this.createGroupForm.controls['description'].setValue(this.groupData.description);
                this.createGroupForm.controls['add_image'].setValue(this.groupData.image);
                this.createGroupForm.controls['created_by'].setValue(this.groupData.created_by);
                this.createGroupForm.controls['team_id'].setValue(this.groupData.team_id);
                this.createGroupForm.controls['participants'].setValue(this.groupParticipant);
              }
            }

          }
        );
    }    
  }

}
