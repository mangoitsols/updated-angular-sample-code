import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../service/language.service';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { appSetting } from '../../../app-settings';
declare var $: any;

@Component({
  selector: 'app-organizer-document',
  templateUrl: './organizer-document.component.html',
  styleUrls: ['./organizer-document.component.css']
})
export class OrganizerDocumentComponent implements OnInit {
  language;
  userDetails;
  userAccess;
	createAccess;
	participateAccess;
	authorizationAccess;
  displayAllDocument:boolean = false;
  displayMyDocument:boolean = true;
  displayClubDocument:boolean = false;
  displayCurrentStatus:boolean = false;
  displayArchivedDocument:boolean = false;
  typeArr: any = [];
  uploadDocVisibility;
  extensions;
  guestRole;
  
  myData;
  myDocExtArr: any = [];
  myDocExt: any = [];
  myDocFileNameArr: any = [];
  
  clubData;
  clubDocExtArr: any = [];
  clubDocExt: any = [];
  clubDocFileNameArr: any = [];

  archivedData;
  archivedDocExtArr: any = [];
  archivedDocExt: any = [];
  archivedDocFileNameArr: any = [];

  constructor(
    private lang: LanguageService,
    private authService: AuthServiceService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.extensions = appSetting.extensions;
    this.uploadDocVisibility = appSetting.uploadDocument;
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole = this.userDetails.roles[0];
    this.guestRole = this.userDetails.roles[0];
		this.userAccess = appSetting.role;
		this.extensions = appSetting.extensions;
		this.createAccess = this.userAccess[userRole].create;
		this.participateAccess = this.userAccess[userRole].participate;
		this.authorizationAccess = this.userAccess[userRole].authorization;

    //for MyDocument
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'documents/fetch/personal', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
       
            this.myData = respData;
            if(this.myData.length){
              this.getMyDocType();
            }
          }
        );
    }

    //for ClubDocument
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'documents/fetch/club', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
  
            this.clubData = respData;
            if(this.clubData.length){
              this.getClubDocType();
            }
          }
        );
    }

    //for archivedDocument
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'documents/fetch/archive', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
         
            this.archivedData = respData;
            if(this.archivedData.length){
              this.getArchivedDocType();
            }
          }
        );
    }
    
    if(this.guestRole  == 'guest'){
      this.displayAllDocument = false;
      this.displayMyDocument = false;
      this.displayClubDocument = true;
      this.displayCurrentStatus = false;
      this.displayArchivedDocument = false;
    }
  }

  getMyDocType() {
    for (const key in this.myData) {
      if (Object.prototype.hasOwnProperty.call(this.myData, key)) {
        const element = this.myData[key];
        var ext = element.path.split(".");
        this.myDocExtArr[key] = ext[(ext.length) - 1];
        var fileName = element.path.split("/");
        this.myDocFileNameArr[key] = fileName[(fileName.length) - 1];
        var docExt = this.myDocExtArr[key];
        var count = key;
        for (const key in this.extensions) {
          if (Object.prototype.hasOwnProperty.call(this.extensions, key)) {
            const element = this.extensions[key];
            if(key == docExt){
              this.myDocExt[count] = element;
            }
          }
        }
      }
    }

  }

  getClubDocType() {
    for (const key in this.clubData) {
      if (Object.prototype.hasOwnProperty.call(this.clubData, key)) {
        const element = this.clubData[key];
        var ext = element.path.split(".");
        this.clubDocExtArr[key] = ext[(ext.length) - 1];
        var fileName = element.path.split("/");
        this.clubDocFileNameArr[key] = fileName[(fileName.length) - 1];
        var docExt = this.clubDocExtArr[key];
        var count = key;
        for (const key in this.extensions) {
          if (Object.prototype.hasOwnProperty.call(this.extensions, key)) {
            const element = this.extensions[key];
            if(key == docExt){
              this.clubDocExt[count] = element;
            }
          }
        }
      }
    }
    
  }

  getArchivedDocType() {
    for (const key in this.archivedData) {
      if (Object.prototype.hasOwnProperty.call(this.archivedData, key)) {
        const element = this.archivedData[key];
        var ext = element.path.split(".");
        this.archivedDocExtArr[key] = ext[(ext.length) - 1];
        var fileName = element.path.split("/");
        this.archivedDocFileNameArr[key] = fileName[(fileName.length) - 1];
        var docExt = this.archivedDocExtArr[key];
        var count = key;
        for (const key in this.extensions) {
          if (Object.prototype.hasOwnProperty.call(this.extensions, key)) {
            const element = this.extensions[key];
            if(key == docExt){
              this.archivedDocExt[count] = element;
            }
          }
        }
      }
    }

  }

  displayDocument(type){
    if(type=='allDocument'){
      this.displayAllDocument = true;
      this.displayMyDocument = false;
      this.displayClubDocument = false;
      this.displayCurrentStatus = false;
      this.displayArchivedDocument = false;
    }
    if(type=='myDocument'){
      this.displayAllDocument = false;
      this.displayMyDocument = true;
      this.displayClubDocument = false;
      this.displayCurrentStatus = false;
      this.displayArchivedDocument = false;
      $('.doc_upload_btn').show();
    }
    if(type=='clubDocument'){
      this.displayAllDocument = false;
      this.displayMyDocument = false;
      this.displayClubDocument = true;
      this.displayCurrentStatus = false;
      this.displayArchivedDocument = false;
      this.checkUpload(type);
    }
    if(type=='currentStatus'){
      this.displayAllDocument = false;
      this.displayMyDocument = false;
      this.displayClubDocument = false;
      this.displayCurrentStatus = true;
      this.displayArchivedDocument = false;
      this.checkUpload(type);
    }
    if(type=='archivedDocument'){
      this.displayAllDocument = false;
      this.displayMyDocument = false;
      this.displayClubDocument = false;
      this.displayCurrentStatus = false;
      this.displayArchivedDocument = true;
      this.checkUpload(type);
    }
    
  }

  checkUpload(type){
    let userRole = this.userDetails.roles;
    let roles:any = [];
  
    for (const key in this.uploadDocVisibility) {
      if (Object.prototype.hasOwnProperty.call(this.uploadDocVisibility, key)) {
        if(key == type){
          roles = this.uploadDocVisibility[key];

        }
      }
    }
    if(roles.length){      
      for (let j = 0; j < userRole.length; j++) {
        const element = userRole[j];
 
        if(roles.includes(element)){
       
          $('.doc_upload_btn').show();
        }
        else{
          $('.doc_upload_btn').hide();
        }
      }
    }
  }

}
