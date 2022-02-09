import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import {Location} from '@angular/common';
import { LanguageService } from '../../../service/language.service';
declare var $: any;

@Component({
  selector: 'app-club-news-details',
  templateUrl: './club-news-details.component.html',
  styleUrls: ['./club-news-details.component.css'],
  
})
export class ClubNewsDetailsComponent implements OnInit {
  language;
  userDetails;
  newsData;
  viewImage:boolean = false;
  displayError = false
  mem_id: any;
  getclubInfo: any;
  birthdateStatus: any;
  profile_data: any;
  memberStartDateStatus: any;
  thumbnail;
  memberPhoto: any;
  memberid: any;

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private confirmDialogService: ConfirmDialogService,
    private lang : LanguageService
  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    this.route.params.subscribe(params => {
      const newsid = params['newsid'];
      this.getNewsDetails(newsid);
      
    });
  }

  getNewsDetails(newsid) {
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
                  }
                )
                
            }else{
              this.getFirstNews(respData);
            }            
            this.authService.setLoader(false);
          }
        );
    }
  }
  getFirstNews(allNews) {
    let news = allNews['result'];
    this.newsData = news;
   
    this.memberid = this.newsData.user.member_id
    this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' + this.memberid, null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.thumbnail = respData;
      });
  }

  getMemId(id){
    let self = this;
    $("#profileSpinner").show();
		if (sessionStorage.getItem('token')) {
			let userData = JSON.parse(localStorage.getItem('user-data'));

			this.authService.memberSendRequest('get', 'get-club-info/' + userData.database_id + '/' + userData.team_id , userData,)
			  .subscribe(
				(respData: JSON) => {
				  this.getclubInfo = respData;
			});
		}

		this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
		.subscribe(
			(respData: any) => {

				var arry:any = [];
				arry = respData;
				arry.forEach(element => {
					if(element.id == id ){
				
            
						this.authService.memberSendRequest('get', 'member-info/21/141/'+element.member_id,null)
						.subscribe(
						  (respData: any) => {	
             
                			
							if(respData['success'] == false){
							  setTimeout(() => {
								this.displayError = true;
								$("#profileSpinner").hide();
							  }, 2000);
							}else{
							  this.birthdateStatus = respData['shareBirthday']
					
							  this.authService.memberSendRequest('get', 'profile-info/21/141/'+element.member_id,null)
								.subscribe(
								  (resp: any) => {                
									if (resp) {
									this.profile_data = resp;
                  
									this.memberStartDateStatus = this.profile_data.membershipStartDate;
									$("#profileSpinner").hide();
									}else{
									  setTimeout(() => {
									  this.displayError = true;
									  $("#profileSpinner").hide();
									  }, 2000);
									}
								  }); 
							}
						  });

					}
				});
			}
		);
    
		
	}


  showToggle:boolean = false;
  onShow(){
    let el = document.getElementsByClassName("bunch_drop");
    if(!this.showToggle){
      this.showToggle = true;
      el[0].className = "bunch_drop show";
    }
    else{
      this.showToggle = false;
      el[0].className = "bunch_drop";
    }
  }

  removeHtml(str) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }

  goBack(){
    this._location.back();
  }

  deleteNews(newsId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.confirmation_message.delete_article, function () {  
      self.authService.setLoader(true);
      self.authService.memberSendRequest('delete', 'news/'+newsId, null)
      .subscribe(
        (respData: any) => {
          self.authService.setLoader(false);
          const url: string[] = ["/clubwall"];
          self.router.navigate(url);
        }
      )
    }, function () {  
    })
  }

  updateNews(newsId) {
    const url: string[] = ["/update-news/"+newsId];
    this.router.navigate(url);
  }

}
