import { Component, OnInit } from '@angular/core';
import { appSetting } from '../../app-settings';
import { LanguageService } from '../../service/language.service';
import { AuthServiceService } from '../../service/auth-service.service';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  language;
  userDetails;
  userAccess;
  createAccess;
  participateAccess;
  authorizationAccess;
  clubNewsCount;
  communityCount;
  organizerCount;
  constructor(private lang : LanguageService,private authService: AuthServiceService,) { }
 
  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    let userId = localStorage.getItem('user-id');
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization; 

    $('.nav')[0].childNodes.forEach(function (val, key) {
      if (val.classList.length) {
     
        val.classList.forEach(function (clName, index) {
          if(clName == "active" && val.childNodes[0].pathname != window.location.pathname){
       
            val.classList.remove("active");
            val.classList.remove("menu-active");
          }
        });
  
      }
    });

    this.authService.memberSendRequest('get', 'number-of-posts', null)
      .subscribe(
        (respData: any) => {
          this.clubNewsCount = respData.value;
        }
      );
      this.authService.memberSendRequest('get', 'getNumberOfApprovedEventsAndTasks/user/'+userId, null)
      .subscribe(
        (respData: any) => {
          this.organizerCount = respData.value;
        }
      );
      this.authService.memberSendRequest('get', 'message/get-message-count', null)
      .subscribe(
        (respData: any) => {
          this.communityCount = respData.value;
        }
      );
  }

}
