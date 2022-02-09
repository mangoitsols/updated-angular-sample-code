import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../service/language.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { appSetting } from '../../../app-settings';
declare var $: any;

@Component({
  selector: 'app-my-document',
  templateUrl: './my-document.component.html',
  styleUrls: ['./my-document.component.css']
})
export class MyDocumentComponent implements OnInit {
  language;
  myData;
  extensions;
  userData;
  uploadDocVisibility;
  optionVisibility;
  eventForm: FormGroup;
  preImage;
  responseMessage;
  viewImage = [];
  docExt: any = [];
  extArr: any = [];
  fileNameArr: any = [];

  constructor(
    private lang: LanguageService,
    private authService: AuthServiceService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.extensions = appSetting.extensions;
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.uploadDocVisibility = appSetting.uploadDocument;
    let category_text = '';
    for (let index = 0; index < $('.nav-tabs').children().length; index++) {
      const element = $('.nav-tabs').children().children();
      if (element[index] && element[index].classList.length >= 2) {
        category_text = element[index].text;
      }
    }
    if (category_text != '') {
    
      let category;
      if (category_text == this.language.club_document.my_documents) {
				category = 'myDocument';
        this.checkUpload(category);
			}
      if (category_text == this.language.club_document.current_status) {
				category = 'currentStatus';
        this.checkUpload(category);
			}
			if (category_text == this.language.club_document.club_documents) {
				category = 'clubDocument';
        this.checkUpload(category);
			}
			if (category_text == this.language.club_document.archived_documents) {
				category = 'archivedDocument';
        this.checkUpload(category);
			}
    }
    
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'documents/fetch/personal', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
    
            this.myData = respData;
            if (this.myData.length) {
              this.getType();
            }
       
          }
        );
    }
  }

  checkUpload(type) {
    let userRole = this.userData.roles;
    let roles: any = [];

    for (const key in this.uploadDocVisibility) {
      if (Object.prototype.hasOwnProperty.call(this.uploadDocVisibility, key)) {
        if (key == type) {
          roles = this.uploadDocVisibility[key];
       
        }
      }
    }
    if (roles.length) {
      for (let j = 0; j < userRole.length; j++) {
        const element = userRole[j];
  
        if (roles.includes(element)) {
          this.optionVisibility = true;
        }
        else {
          this.optionVisibility = false;
        }
      }

    }
  }

  getType() {
    for (const key in this.myData) {
      if (Object.prototype.hasOwnProperty.call(this.myData, key)) {
        const element = this.myData[key];
        var ext = element.path.split(".");
        this.extArr[key] = ext[(ext.length) - 1];
        var fileName = element.path.split("/");
        this.fileNameArr[key] = decodeURIComponent(fileName[(fileName.length) - 1]);
        var docExt = this.extArr[key];
        var count = key;
        for (const key in this.extensions) {
          if (Object.prototype.hasOwnProperty.call(this.extensions, key)) {
            const element = this.extensions[key];
            if (key == 'png' || key == 'jpg' || key == 'jpeg') {
              this.docExt[count] = this.myData[count].path;
            }
            else {
              if (key == docExt) {
                this.docExt[count] = element;
              }
            }
          }
        }
      }
    }

  }
  isVisible: boolean = false;
  showDropdown() {
    if (!this.isVisible)
      this.isVisible = true;
    else
      this.isVisible = false;
  }

  showToggle: boolean = false;
  onShow() {
    let el = document.getElementsByClassName("navbar-collapse");
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = "navbar-collapse show";
    }
    else {
      this.showToggle = false;
      el[0].className = "navbar-collapse";
    }
  }

  moveDoc(id: number, category: string) {
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');

      this.eventForm = new FormGroup({
        'category': new FormControl(category),
        'id': new FormControl(id)
      });
 

      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'documents/move', this.eventForm.value)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
      
            if (respData['category'] == category) {
              this.responseMessage = this.language.move_document.move_doc_success;
              setTimeout(function () {
                window.location.reload();
              }, 3000);
            }
            else {
              this.responseMessage = this.language.move_document.move_doc_error;
            }
          }
        );
    }
  }

  deleteDoc(id: number, index: number) {
    let userData = JSON.parse(localStorage.getItem('user-data'));
    if (sessionStorage.getItem('token') && (this.myData[index].created_by == userData['id'] || userData.isAdmin)) {
      let userId = localStorage.getItem('user-id');
 
      this.authService.setLoader(true);
      this.authService.memberSendRequest('delete', 'documents/delete/' + id, null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
   
            this.successMessage(respData);
            if (respData['code'] == 400) {
              this.responseMessage = respData['message'];
            }
          }
        );
    }
  }

  successMessage(msg: any) {
    if (msg == "Document succesfully deleted") {
      this.responseMessage = this.language.move_document.delete_doc_success;
      setTimeout(function () {
        window.location.reload();
      }, 3000);
      return true;
    }
  }

  previewImage(id) {
  
    this.viewImage[id] = true;
    this.preImage = this.myData[id].path;
  }
}
