import { Component, OnInit } from '@angular/core';
import { appSetting } from '../../app-settings';
import { LanguageService } from '../../service/language.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthServiceService } from '../../service/auth-service.service';
import { ConfirmDialogService } from '../../confirm-dialog/confirm-dialog.service';
declare var $: any;

@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.component.html',
  styleUrls: ['./create-chat.component.css']
})
export class CreateChatComponent implements OnInit {
  language;
  userAccess;
  createAccess;
  participateAccess;
  authorizationAccess;

  visiblity = [];
  visiblityDropdownSettings;
  selectedVisiblity;
  userDetails;

  groups;
  groupDropdownSettings;

  alluserInformation = [];
  alluserDetails;
  userDropdownList = [];
  userDropdownSettings;

  files: string[] = [];

  responseMessage = null;
  messageForm: FormGroup;
  chatForm: FormGroup;
  formError: any = [];
  messageSubmitted = false;

  chatFormSubmitted = false;

  personalVisiable = true;
  groupVisiable = false;
  clubVisiable = false;

  clubChatVisible = false;
  clubChatUsers = [];
  groupSelected = [];
  groupChatVisible = false;

  clubUsers = [];
  receipientUsers = [];

  constructor(
    private lang: LanguageService,
    private authService: AuthServiceService,
    public formBuilder: FormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;

    this.getGroup();
    this.getAllUserInfo();

    this.chatForm = new FormGroup({
      'kind': new FormControl('', Validators.required),
      'currentUid': new FormControl(this.userDetails.id),
      'friendUid': new FormControl(''),
      'groupId': new FormControl(''),
      'message': new FormControl('', Validators.required)
    });

    this.visiblity = [
      { "id": "personal", "name": this.language.create_chat.personal_chat},
      { "id": "group", "name": this.language.create_chat.group_chat},
    ];

    this.visiblityDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText:this.language.header.search
    };
  }

  close() {
 
    window.history.back();
  }

  onVisiblitySelect(item: any) {

    this.selectedVisiblity = item.id;
    if (this.selectedVisiblity == "personal") {
      this.personalVisiable = true;
      this.groupVisiable = false;
      this.clubVisiable = false;

      this.clubChatVisible = true;
      this.groupChatVisible = false;
      if(this.chatForm.contains('groupId')){
        this.chatForm.removeControl('groupId');
        this.chatForm.addControl('friendUid', this.formBuilder.control('', [Validators.required])); 
      }
    }
    else if (this.selectedVisiblity == "group") {
      this.personalVisiable = false;
      this.groupVisiable = true;
      this.clubVisiable = false;

      this.clubChatVisible = false;
      this.groupChatVisible = true;
      if(this.chatForm.contains('friendUid')){
        this.chatForm.removeControl('friendUid');
        this.chatForm.addControl('groupId', this.formBuilder.control('', [Validators.required])); 
      }
    } else {
      this.personalVisiable = true;
      this.groupVisiable = false;
      this.clubVisiable = true;
    }
  }

  onVisiblityDeSelect(item: any) {
  
  }

  getAllUserInfo() {
    let self = this;
    this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
      .subscribe(
        (respData: JSON) => {
          Object(respData).forEach((val, key) => {
            this.alluserInformation[val.keycloak_id] = { firstname: val.firstname, lastname: val.lastname, email: val.email };
            this.userDropdownList.push({ 'id': val.keycloak_id, 'name': val.firstname + ' ' + val.lastname });
          })
          this.alluserDetails = respData;
          self.userDropdownSettings = {
           
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            selectAllText: 'Select All',
            enableCheckAll: false,
            unSelectAllText: 'UnSelect All',
            allowSearchFilter: true,
            searchPlaceholderText:this.language.header.search
          };
        }
      );
  }

  getGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamgroups/1', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.groups = respData;
            this.groupDropdownSettings = {
              singleSelection: true,
              idField: 'id',
              textField: 'name',
              selectAllText: 'Select All',
              enableCheckAll: false,
              unSelectAllText: 'UnSelect All',
              allowSearchFilter: true,
              searchPlaceholderText:this.language.header.search
            };
          }
        );
    }
  }

  onFriendSelect(item: any) {
 
    this.clubChatUsers.push(item.id);
  }

  onFriendDeSelect(item: any) {
  
    this.clubChatUsers.forEach((value, index) => {
      if (value.id == item.id) {
        this.clubChatUsers.splice(index, 1);
      }
    });
  }

  onGroupSelect(item: any) {
;
    this.groupSelected.push(item.id);
  }

  onGroupDeSelect(item: any) {
   
    this.groupSelected.forEach((value, index) => {
      if (value.id == item.id) {
        this.groupSelected.splice(index, 1);
      }
    });
  }

  messageProcess() {
   
    this.chatFormSubmitted = true;
    if ((sessionStorage.getItem('token')) && (this.chatForm.valid)) {
      var formData1 = [];
      formData1['currentUid'] = this.chatForm.controls['currentUid'].value;
      formData1['friendUid'] = this.chatForm.controls['friendUid'].value[0].id;
      formData1['message'] = {'message': this.chatForm.controls['message'].value};

 
      var arrayToString = JSON.stringify(Object.assign({}, formData1));
      var dataToApi = JSON.parse(arrayToString);
  

      this.authService.memberSendRequest('post', 'store-messages', dataToApi)
        .subscribe(
          (respData) => {
            this.authService.setLoader(false);
          
            if (respData['isError'] == false) {
              this.responseMessage = respData['result']['message'];
              this.chatForm.reset();
              this.chatFormSubmitted = false;
            
              var self = this;
              setTimeout(function () {
                self.router.navigate(['community']);
              }, 3000);
            }
            if (respData['code'] == 400) {
              this.responseMessage = respData['message'];
            }
          }
        );
    }
  }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    const mimeType = file.type;
    this.messageForm.patchValue({
      file: file
    });
    this.messageForm.get('file').updateValueAndValidity();

    const reader = new FileReader();
    var imagePath = file;
    reader.readAsDataURL(file);
    var url;
    reader.onload = (_event) => {
      url = reader.result;
      if (mimeType.match(/image\/*/)) {
        $('.preview_img').attr('src', url);
      } else {
        $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
      }

    }
    $('.message-upload-list').show();
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);

  }
  onFileChange(event) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.files.push(event.target.files[i]);
    }
  }

}
