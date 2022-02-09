import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';
declare var $: any;

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {
  language;
  submitted = false;
  userDetails;
  receiveData;
  createGroupForm: FormGroup;
  showParticipants = false;
  participant = [];
  participantSelectedItem = [];
  participantSelectedToShow = [];
  participantDropdownSettings;
  participantList = [];
  responseMessage = null;
  constructor(
    private authService: AuthServiceService,
    public formBuilder: FormBuilder,
    private router: Router,
    private lang : LanguageService
  ) { }

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
    this.getUsers();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
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
      name: ['', [Validators.required, this.noWhitespace]],
      description: ['', Validators.required],
      add_image: ["null"],
      created_by: [localStorage.getItem('user-id')],
      team_id: [1],
      approved_status: [''],
      participants: ['', Validators.required]
    });
  }

  noWhitespace(control: FormControl) {
    if(control.value && control.value.length != 0){
      let isWhitespace = (control.value || '').trim().length === 0;
      let isValid = !isWhitespace;
      return isValid ? null : { 'whitespace': true }
    }
    else{
      let isValid = true;
      return isValid ? null : { 'whitespace': true }
    }
  }

  getUsers() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.receiveData = respData;
            console.log(respData);
            
            Object(respData).forEach((val,key) => {
              if (val.id != localStorage.getItem('user-id')) {
                this.participant.push({
                  'id': val.id,
                  'user_email': val.email,
                  'user_name': val.firstname + " " + val.lastname + " (" + val.email + " )"
                });
              }
            })
            console.log(this.participant);
            
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
      if (value.id == item.id){
        this.participantSelectedToShow.splice(index, 1);
      }
    });
    this.participantSelectedItem.forEach((value, index) => {
      if (value == item.id){
        this.participantSelectedItem.splice(index, 1);
      }
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
        add_image: file
      });
      this.createGroupForm.get('add_image').updateValueAndValidity();
    }
    const reader = new FileReader();
    var imagePath = file;
    reader.readAsDataURL(file);
    var url;
    let self = this
    reader.onload = (_event) => {
      url = reader.result;

      var imagee = new Image();
      imagee.src = URL.createObjectURL(file);

      imagee.onload = (e: any) => {
		  
        const imagee = e.path[0] as HTMLImageElement;
        console.log(imagee.height);
        console.log(imagee.width);
        var imgHeight = imagee.height
        var imgWidth = imagee.width
        if ((imgHeight >= 1000 && imgHeight <= 1100) && (imgWidth >= 1000 && imgWidth <= 1100)) {
          $('.preview_img').attr('src', url);
        }
        else {
          self.errorImage = { isError: true, errorMessage: '' };
        }
      }
    }
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);
  }

  onCancel() {
    window.history.back();
  }

  createGroup() {
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
        })
      }

      this.createGroupForm.get('participants').setValue(this.participantList);
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
      this.authService.memberSendRequest('post', 'createGroup', formData)
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
              var redirectUrl = 'group-detail/'+respData['result']['group']['id'];
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
}
