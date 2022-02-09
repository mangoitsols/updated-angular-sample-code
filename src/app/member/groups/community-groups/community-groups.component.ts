import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { LanguageService } from '../../../service/language.service';
declare var $ : any;

@Component({
  selector: 'app-community-groups',
  templateUrl: './community-groups.component.html',
  styleUrls: ['./community-groups.component.css']
})
export class CommunityGroupsComponent implements OnInit {
  language;
  groupData;
  groupJoinData;
  groupsYouManageData;
  constructor( 
    private authService: AuthServiceService, 
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private lang : LanguageService
    ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.teamAllGroups();
    this.joinAllGroups();
    this.groupsYouManage();
    
  }

  teamAllGroups(){
    let userId = localStorage.getItem('user-id');
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getGroupsNotParticipant/user/'+userId, null)
        .subscribe(
          (respData: any) => {
            this.groupData = respData.reverse();
            this.authService.setLoader(false);
          }
        );
  }

  joinAllGroups(){
    let userId = localStorage.getItem('user-id');
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'web/get-groups-by-user-id/'+userId, null)
        .subscribe(
          (respData: any) => {
            this.groupJoinData = respData.reverse();
            this.authService.setLoader(false);
          }
        );
  }

  groupsYouManage(){
    let userId = localStorage.getItem('user-id');
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getGroupsYouManage/'+userId, null)
        .subscribe(
          (respData: any) => {
            this.groupsYouManageData = respData.reverse();
            this.authService.setLoader(false);
          }
        );
  }

  onGroups(id){
    $('.tab-pane').removeClass('active');
    $('.nav-link').removeClass('active');
    if (id == 1){
      $('#tabs-1').show();
      $('#tabs-2').hide();
      $('#tabs-1').addClass('active');
      $('.group_ic').addClass('active');
    }else{
      $('#tabs-1').hide();
      $('#tabs-2').show();
      $('#tabs-2').addClass('active');
      $('.per_ic').addClass('active');
    }
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
      self.authService.memberSendRequest('post', 'joinGroup/user_id/'+userId+'/group_id/'+groupId, postData)
      .subscribe(
        (respData: JSON) => {  
          self.teamAllGroups();
          self.joinAllGroups();      
        }
      )
    }, function () {  
    })  
  }

  leaveGroup(groupId){
    let self = this;
    this.confirmDialogService.confirmThis(this.language.community_groups.leave_group_popup, function () {  
      let userId = localStorage.getItem('user-id');
      self.authService.memberSendRequest('delete', 'leaveGroup/user/'+userId+'/group_id/'+groupId, null)
      .subscribe(
        (respData: JSON) => {
          self.teamAllGroups();
          self.joinAllGroups();
        }
      )
    }, function () {  
    }) 
  }

}
