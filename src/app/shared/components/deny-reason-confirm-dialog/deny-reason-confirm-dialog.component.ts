import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthService, LanguageService } from '@core/services';
import { Router } from '@angular/router';
import { DenyReasonConfirmDialogService } from '@shared/components';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-deny-reason-confirm-dialog',
  templateUrl: './deny-reason-confirm-dialog.component.html',
  styleUrls: ['./deny-reason-confirm-dialog.component.css'],
})
export class DenyReasonConfirmDialogComponent implements OnInit {
  language: any;
  denyGroupForm: UntypedFormGroup;
  delete_id: any;
  approved_status: number;
  userDetails: any;
  endPoints: string;
  method: string;
  delete_endpoints: string;
  navigation_path: string;
  deviceCheck: any = 'web';
  socket: Socket;

  constructor(
    private lang: LanguageService,
    public formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private _router: Router,
    private denyReasonService: DenyReasonConfirmDialogService,
    public dialogRef: MatDialogRef<DenyReasonConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);
    const isMobileView = window.innerWidth <= 768; // Adjust the threshold as needed

    this.deviceCheck = isMobileView ? 'mobile' : 'web';

    this.denyGroupForm = this.formBuilder.group({
      reason: [''],
    });

    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    if (this.data && this.data.section) {
      if (this.data.section == 'Group') {
        this.endPoints = 'getAdminDenyGroups/';
      } else if (this.data.section == 'Task') {
        this.endPoints = 'get-users-denytask/';
      } else if (this.data.section == 'Instructor') {
        this.endPoints = 'get-users-denyinstructor/';
      } else if (this.data.section == 'Room') {
        this.endPoints = 'get-users-denyroom/';
      } else if (this.data.section == 'Event') {
        this.endPoints = 'get-users-denyevent/';
      } else if (this.data.section == 'Course') {
        this.endPoints = 'get-admin-denyCourses/';
      } else if (this.data.section == 'Survey') {
        this.endPoints = 'get-users-denysurvey/user_id/';
      } else if (this.data.section == 'News') {
        this.endPoints = 'get-users-denynews/';
      } else if (this.data.section == 'FAQS') {
        this.endPoints = 'get-users-denyfaq/';
      }
      this.authService.memberSendRequest('get', this.endPoints + this.userDetails.userId, null).subscribe((respData: any) => {
        if (respData && respData.length > 0) {
          respData.forEach(element => {
            if (element.id == this.data.sectionId) {
              this.delete_id = this.data.sectionId;
              if (this.data.section == 'Task') {
                this.approved_status = element.status;
              } else {
                this.approved_status = element.approved_status;
              }
              this.denyGroupForm.controls['reason'].setValue(element.deny_reason);
            }
          });
        }
      });
    }
    // });
  }

  deleteFunction() {
    if (this.data.section == 'News') {
      if (this.approved_status == 1) {
        this.authService.memberSendRequest('get', 'get-reset-updatednews/' + this.delete_id, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          const url: string[] = [this.deviceCheck + '/clubnews-detail/' + this.delete_id];
          this._router.navigate(url);
          this.ngOnInit();

          setTimeout(() => {
            this.data.yesFn();
          }, 1000);
        });
      } else if (this.approved_status == 0) {
        let userId: string = localStorage.getItem('user-id');
        this.authService.memberSendRequest('delete', 'news/' + this.delete_id + '/user/' + userId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          const url: string[] = [this.deviceCheck + '/clubwall'];
          this._router.navigate(url);
        });
      }
      this.dialogRef.close(true);
      this.socket.emit('sendNotification', this.data.section, (error: any) => {});
    }

    if (this.data.section != 'News') {
      if (this.data.section == 'Group') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedGroupDetails/group_id/';
          this.navigation_path = this.deviceCheck + '/group-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'deleteGroup/';
          this.navigation_path = this.deviceCheck + '/community/groups';
        }
      } else if (this.data.section == 'Task') {
        if (this.approved_status == 0) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedtask/';
          this.navigation_path = this.deviceCheck + '/task-detail/' + this.delete_id;
        } else if (this.approved_status == 2) {
          this.method = 'delete';
          this.delete_endpoints = 'DeleteTask/';
          this.navigation_path = this.deviceCheck + '/tasks/organizer-task';
        }
      } else if (this.data.section == 'Instructor') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedinstructor/';
          this.navigation_path = this.deviceCheck + '/instructor-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'deleteInstructor/';
          this.navigation_path = this.deviceCheck + '/instructor';
        }
      } else if (this.data.section == 'Room') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedroom/';
          this.navigation_path = this.deviceCheck + '/room-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'deleteRooms/';
          this.navigation_path = this.deviceCheck + '/room';
        }
      } else if (this.data.section == 'Survey') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedsurvey/';
          this.navigation_path = this.deviceCheck + '/survey-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'deleteSurvey/';
          this.navigation_path = this.deviceCheck + '/survey';
        }
      } else if (this.data.section == 'Event') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedevent/';
          this.navigation_path = this.deviceCheck + '/event-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'event/';
          this.navigation_path = this.deviceCheck + '/organizer';
        }
      } else if (this.data.section == 'Course') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedCourses/';
          this.navigation_path = this.deviceCheck + '/course-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'deleteCourse/';
          this.navigation_path = this.deviceCheck + '/course';
        }
      } else if (this.data.section == 'FAQS') {
        if (this.approved_status == 1) {
          this.method = 'get';
          this.delete_endpoints = 'get-reset-updatedfaq/';
          this.navigation_path = this.deviceCheck + '/vereins-faq-detail/' + this.delete_id;
        } else if (this.approved_status == 0) {
          this.method = 'delete';
          this.delete_endpoints = 'deleteFaq/';
          this.navigation_path = this.deviceCheck + '/vereins-faq';
        }
      }
      this.authService.memberSendRequest(this.method, this.delete_endpoints + this.delete_id, null).subscribe((respData: any) => {
        this.ngOnInit();
        this._router.navigate([this.navigation_path]);
        this.dialogRef.close(true);
        this.data.section == 'FAQS' ? 'FAQ' : this.data.section;
        this.socket.emit('sendNotification', this.data.section, (error: any) => {});
      });
    }
  }
}
