import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { Location } from '@angular/common';
import { LanguageService } from '../../../service/language.service';

declare var $ :any;
@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  language;
  groupData;
  groupJoinData;
  groupDetails :any;
  groupNewsDetails = true;
  groupAction = 0;
  showGroupNews;
  userId;
  userDetails

  currentPageNmuber: number = 1; 
  itemPerPage = 8;
  newsTotalRecords = 0;
  limitPerPage = [
    { value: '8'},
    { value: '16'},
    { value: '24'},
    { value: '32'},
    { value: '40'}
 ];
  getclubInfo: any;
  displayError: boolean;
  birthdateStatus: any;
  profile_data: any;
  memberStartDateStatus: any;
  mem_id;
  alluserInformation = [];
  thumb: any;
  thumbnail: any;

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService
  ) { }

  ngOnInit(): void {
    this.getAllUserInfo();
    this.language = this.lang.getLanguaageFile();
    this.userId = localStorage.getItem('user-id');
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    
    this.route.params.subscribe(params => {
      const groupid = params['groupid'];
      this.getGroupDetails(groupid);
    });
  }

  getMemId(id){
		let self = this;

    self.groupDetails.participants.forEach(element => {
      if(element.id == id){
  
         self.mem_id = element.groupusers[0].id
      }
    });

    $("#profileSpinner").show();
		if (sessionStorage.getItem('token')) {
			let userData = JSON.parse(localStorage.getItem('user-data'));
			this.authService.setLoader(false);
			this.authService.memberSendRequest('get', 'get-club-info/' + userData.database_id + '/' + userData.team_id , userData,)
			  .subscribe(
				(respData: JSON) => {
				  this.authService.setLoader(false);
				  this.getclubInfo = respData;
			});
		}

		this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
		.subscribe(
			(respData: any) => {
				var arry:any = [];
				arry = respData;
				arry.forEach(element => {
					if(element.id == self.mem_id ){
						
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
                    console.log(resp);
                                 
									if (resp) {
									this.profile_data = resp;
									this.memberStartDateStatus = this.profile_data.membershipStartDate;

                  this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' + element.member_id, null)
									.subscribe(
									  (respData: JSON) => {
										  console.log(respData);
										  
										this.authService.setLoader(false);
										this.thumbnail = respData;
										console.log(this.thumbnail);
										
								  });

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

	getAllUserInfo() {
		let self = this;
		this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
		.subscribe(
			(respData: JSON) => {
				Object(respData).forEach((val, key) => {
				this.alluserInformation[val.id] = { member_id: val.member_id};
				})
			}
		);
	}

  getGroupDetails(groupid) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      var user_id = localStorage.getItem('user-id');
      this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + groupid, null)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            this.groupDetails = respData[0];
                Object(this.groupDetails.participants).forEach((val, key) => {
                   if(this.alluserInformation[val.user_id] && this.alluserInformation[val.user_id].member_id != null){
                      this.authService.memberInfoRequest('get', 'profile-photo?database_id=21&club_id=141&member_id=' +this.alluserInformation[val.user_id].member_id, null)
                      .subscribe(
                      (resppData: JSON) => {
                                this.thumb = resppData;
                                val.imagePro = this.thumb;  
                              });
                    }else{
                              val.imagePro = null;
                        }
                });		
            for (const key in this.groupDetails.participants) {
              if (Object.prototype.hasOwnProperty.call(this.groupDetails.participants, key)) {
                const element = this.groupDetails.participants[key];
                if (element.user_id.toString() == user_id) {
                  this.groupAction = 1;
                  this.getGroupNews(groupid);
                }
               
              }
            }
           
          });
    }
  }

  getGroupNews(groupid) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      var user_id = localStorage.getItem('user-id');
      this.authService.memberSendRequest('get', 'groupNews/groupId/' + groupid, null)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            this.newsTotalRecords = respData.length;
            this.groupNewsDetails = respData;           
          }
        );
    }
  }

  showToggle: boolean = false;
  onShow() {
    let el = document.getElementsByClassName("bunch_drop");
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = "bunch_drop show";
    }
    else {
      this.showToggle = false;
      el[0].className = "bunch_drop";
    }
  }

  goBack() {
    localStorage.setItem('backItem','groups');
    const url: string[] = ["/community"];
    this.router.navigate(url);
  }

  joinGroup(groupId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.community_groups.join_group_popup, function () {
      let userId = localStorage.getItem('user-id');
      let postData = {
        "participants": {
          "group_id": groupId,
          "user_id": userId,
          "approved_status": 2
        }
      };
      self.authService.memberSendRequest('post', 'joinGroup/user_id/' + userId + '/group_id/' + groupId, postData)
        .subscribe(
          (respData: JSON) => {
            self.teamAllGroups();
            self.joinAllGroups();
          }
        )
    }, function () {
    })
  }

  leaveGroup(groupId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.community_groups.leave_group_popup, function () {
      let userId = localStorage.getItem('user-id');
      self.authService.memberSendRequest('delete', 'leaveGroup/user/' + userId + '/group_id/' + groupId, null)
        .subscribe(
          (respData: JSON) => {
            self.teamAllGroups();
            self.joinAllGroups();
          }
        )
    }, function () {
    })
  }

  teamAllGroups() {
    let userId = localStorage.getItem('user-id');
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getGroupsNotParticipant/user/' + userId, null)
      .subscribe(
        (respData: JSON) => {
          this.groupData = respData;
          this.authService.setLoader(false);
        }
      );
  }

  joinAllGroups() {
    let userId = localStorage.getItem('user-id');
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'approvedUserGroups/user/' + userId, null)
      .subscribe(
        (respData: JSON) => {
          this.groupJoinData = respData;
          this.authService.setLoader(false);
          this.router.navigate(['community']);
        }
      );
  }

  deleteGroup(groupId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.community_groups.delete_group_popup, function () {
      self.authService.setLoader(true);
      self.authService.memberSendRequest('delete', 'deleteGroup/' + groupId, null)
        .subscribe(
          (respData: JSON) => {
            self.authService.setLoader(false);
            self.router.navigate(['community']);
          }
        )
    }, function () {
    })
  }

  pageChanged(event){
    this.currentPageNmuber = event;
  }

  goToPg(eve: number) {
    if (isNaN(eve)) {
      eve = this.currentPageNmuber;
    }
    this.currentPageNmuber = eve;
  }
  setItemPerPage(limit: number) {
    if (isNaN(limit)) {
      limit = this.itemPerPage;
    }
  
    this.itemPerPage = limit;
  }

}
