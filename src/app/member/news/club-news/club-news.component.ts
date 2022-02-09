import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import { ConfirmDialogService } from 'src/app/confirm-dialog/confirm-dialog.service';
import { element } from 'protractor';

declare var $: any;

@Component({
  selector: 'app-club-news',
  templateUrl: './club-news.component.html',
  styleUrls: ['./club-news.component.css']
})
export class ClubNewsComponent implements OnInit {
  language;
  dashboardData;
  userData;
  role = '';
  guestNews = [];
  thumbnail:any;
  thumbnail1:any;
  num = 4;
  num1 = 3;
  url: any;
  newsData: any;
  memberid: any;
  displayError = false;
  newsDetails = [];
  title: any;
  firstname: any;
  lastname: any;
  created_at: any;
  imageUrls: any;
  headline: any;
  text: any;
  keycloak_id: any;
  id: any;
  newsid: any;
  displayPopup =  false;
  mid: any;
  thumb;
  responseMessage: any;
  mem_id: any;
  proImage: any;
  newsDisplay;

  constructor(
    private authService: AuthServiceService,
    private lang : LanguageService,
    private router: Router,
    private _location: Location,
    private confirmDialogService: ConfirmDialogService,

  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.role = this.userData.roles[0];
    this.url = this.router.url

    if(this.url == '/dashboard'){
      this.num = 4;
      this.num1 = 3;
      this.displayPopup =  true;
      this.newsDisplay = 6;
    }else if(this.url == '/clubwall/club-news' || this.url == '/clubwall'){
      this.num = 3;
      this.num1 = 4;
      this.displayPopup =  false;
      this.newsDisplay = 4;
    }
  
    this.getAllNews();
  }
  getAllNews() {
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');
      // this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'news/user/'+userId, null)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            this.dashboardData = respData;     
            // console.log(this.dashboardData);
            
            this.dashboardData.forEach((element,index) => {
                if (index < 7){
                  if(element.user.member_id != null){
                  this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' +element.user.member_id, null)
                  .subscribe(
                    (resppData: JSON) => {
                      this.thumb = resppData;
                      element.user.image = this.thumb;                      
                      this.authService.setLoader(false); 
                    })
                  }else{
                    element.user.image = '';
                  }
                }
              });
            if(this.role == 'guest'){
              this.guestNews = [];
              for (const key in this.dashboardData) {
                if (Object.prototype.hasOwnProperty.call(this.dashboardData, key)) {
                  const element = this.dashboardData[key];        
                  if(element.show_guest_list == 'true'){
                    this.guestNews.push(element);
                  }
                }
              }
              this.guestNews.forEach((element,index) => {
                    if (index < 4){
                      this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' +element.user.member_id, null)
                      .subscribe(
                        (resppData: JSON) => {
                          this.proImage = resppData;                    
                          this.authService.setLoader(false); 
                        })
                    }
              });
           
            }        
             ;

           }
        );
   }
  }
  getNewsDetails(newsid) {
    // if(this.displayPopup == false){
    // this.router.navigate(['/clubnews/'+newsid]);
    // }else{ 
      if (sessionStorage.getItem('token')) {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('get', 'get-news-by-id/'+newsid, null)
          .subscribe(
            (respData: any) => {       
              if(respData.result.groups && respData.result.groups.length > 0 && respData.result.groups[0].group.id){
                this.authService.memberSendRequest('get', 'approvedGroupUsers/group/'+respData.result.groups[0].group.id, null)
                  .subscribe(
                    (resp: any) => {
                      let userId = localStorage.getItem('user-id');

                      let checkGroup = 0;
                      resp[0].participants.forEach((value, index) => {
                        if(value.user_id == userId){
                          checkGroup = 1;
                        }
                      });
                      if(checkGroup ==  1){
                        this.getFirstNews(respData);
                      }else{
                        var redirectUrl = 'clubwall/';
                        this.router.navigate([redirectUrl]);
                      }
                      this.authService.setLoader(false);
                    }
                  )
                  
              }else{
                this.getFirstNews(respData);
                this.authService.setLoader(false);
              }            
          
            }

          );
      }
    // }
  }
  getFirstNews(allNews) {
    let news = allNews['result'];
    this.newsData = news;

    this.memberid = this.newsData.user.member_id;
    this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' + this.memberid, null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.thumbnail = respData;
      });
  }
  
  showAll(){
    this.router.navigate(['/clubwall-news/1']);
  }
  showToggle:boolean = false;
  removeHtml(str) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }  

}
