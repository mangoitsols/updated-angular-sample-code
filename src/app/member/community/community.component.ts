import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../service/language.service';
import { AuthServiceService } from '../../service/auth-service.service';
import { Router } from '@angular/router';
import { appSetting } from '../../app-settings'
@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  language;
  userDetails;
  userAccess;
  createAccess;
  participateAccess;
  authorizationAccess;
  communityCount;
  displayMessages:boolean = false;
  displayGroups:boolean = false;

  constructor(private lang : LanguageService, private authService: AuthServiceService,private router:Router) { 
    var getParamFromUrl = this.router.url.split("/")['2'];
    if(getParamFromUrl == 'community-groups'){
      this.displayGroups = true;
    }else {
      this.displayMessages = true;
    }
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization; 

    
    if (localStorage.getItem('backItem')){
      if(localStorage.getItem('backItem') == 'groups'){
        localStorage.removeItem('backItem');
        this.onGroups();
      }
    }

    this.authService.memberSendRequest('get', 'message/get-message-count', null)
      .subscribe(
        (respData: any) => {
          this.communityCount = respData.value;
        }
      );
  }

  onMessages(){
    this.displayMessages = true;
    this.displayGroups = false;
  }

  onGroups(){
    this.displayGroups = true;
    this.displayMessages = false;
  }

}
