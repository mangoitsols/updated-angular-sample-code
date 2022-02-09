import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';
declare var $: any;

@Component({
    selector: 'app-club-all-news',
    templateUrl: './club-all-news.component.html',
    styleUrls: ['./club-all-news.component.css']
})
export class ClubAllNewsComponent implements OnInit {
    language;
    userData;
    role = '';
    dashboardData;
    responseMessage = null;
    guestNews = [];
    currentPageNmuber: number = 1;
    itemPerPage = 8;
    newsTotalRecords = 0;
    guestNewsRecords = 0;
    limitPerPage = [
        { value: '8' },
        { value: '16' },
        { value: '24' },
        { value: '32' },
        { value: '40' }
    ];
    thumbnails = [];
    memberid: any;
    thumb: any;
    newsData: any;
    thumbnail: any;
    constructor(
        private authService: AuthServiceService,
        private router: Router,
        private lang: LanguageService
    ) { }

    ngOnInit(): void {
        this.language = this.lang.getLanguaageFile();
        this.userData = JSON.parse(localStorage.getItem('user-data'));
        this.role = this.userData.roles[0];
        this.getAllNews();
    }

    getAllNews() {
        if (sessionStorage.getItem('token')) {
            this.authService.setLoader(true);
            let userId = localStorage.getItem('user-id');
            //api/posts/2/10
            //this.authService.memberSendRequest('get', 'news/user/' + userId, null)
            this.authService.memberSendRequest('get', 'posts/'+this.currentPageNmuber+'/'+this.itemPerPage, null)
                .subscribe(
                    (respData: any) => {
                        this.newsTotalRecords = respData.pagination.rowCount;
                        this.dashboardData = respData.news;

                        this.dashboardData.forEach(element => {

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
    
      
    removeHtml(str) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = str;
        return tmp.textContent || tmp.innerText || "";
    }

    pageChanged(event) {
        this.currentPageNmuber = event;
        this.getAllNews();
    }

    goBack() {
        window.history.back();
    }

    goToPg(eve: number) {
        this.responseMessage = null;
 
        if (isNaN(eve)) {
            eve = this.currentPageNmuber;
        }
        else {
            if (eve > Math.round(164 / 8)) {
                this.responseMessage = this.language.error_message.invalid_pagenumber;             
            }
            else {
                this.currentPageNmuber = eve;
            }
        }
    }

    setItemPerPage(limit: number) {
        if (isNaN(limit)) {
            limit = this.itemPerPage;
        }    
        this.itemPerPage = limit;
        this.getAllNews();
    }

}
