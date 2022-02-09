import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';

@Component({
  selector: 'app-group-news',
  templateUrl: './group-news.component.html',
  styleUrls: ['./group-news.component.css']
})
export class GroupNewsComponent implements OnInit {

  language
  groupNewsData;
  guestGroupNews = [];
  userData;
  role = '';
  newsData: any;
  thumbnail: any;
  memberid: any;
  newsTitle: any;

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private lang : LanguageService
  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.role = this.userData.roles[0];
    this.getAllNews();
  }

  getAllNews() {
    if (sessionStorage.getItem('token')) {
      let userId = localStorage.getItem('user-id');
      this.authService.memberSendRequest('get', 'get-group-news-by-user-id/'+userId, null)
        .subscribe(
          (respData: JSON) => {
            this.groupNewsData = respData['result'];
   
            
            if(this.role == 'guest'){
              this.guestGroupNews = [];
              for (const key in this.groupNewsData) {
                if (Object.prototype.hasOwnProperty.call(this.groupNewsData, key)) {
                  const element = this.groupNewsData[key];
                  if(element.news.show_guest_list == 'true'){
                    this.guestGroupNews.push(element);
                  }
                }
              }
            }
          }
        );
    }
  }

  getNewsDetails(newsid) {
    console.log(newsid);
    
      if (sessionStorage.getItem('token')) {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('get', 'get-news-by-id/'+newsid, null)
          .subscribe(
            (respData: any) => {      
              console.log(respData);
               
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
  }
  getFirstNews(allNews) {
    let news = allNews['result'];
    this.newsData = news;
    this.newsTitle = this.newsData.title
    console.log(this.newsData);
    console.log(this.newsTitle);
    
    this.memberid = this.newsData.user.member_id;
    this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' + this.memberid, null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.thumbnail = respData;
      });
  }


  removeHtml(str) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }

}
