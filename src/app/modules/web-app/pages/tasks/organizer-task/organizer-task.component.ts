import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';

declare var $: any;

@Component({
  selector: 'app-organizer-task',
  templateUrl: './organizer-task.component.html',
  styleUrls: ['./organizer-task.component.css'],
})
export class OrganizerTaskComponent implements OnInit, OnDestroy {
  language: any;
  displayAllTasks: boolean = true;
  displayPersonalTasks: boolean = false;
  displayGroupTasks: boolean = false;
  displayCreatedTasks: boolean = false;
  setTheme: ThemeType;
  userDetails: any;
  private activatedSub: Subscription;
  organizerTask: any;
  user_id: string;

  constructor(private themes: ThemeService, private authService: AuthService, private notificationService: NotificationService, private lang: LanguageService, private commonFunctionService: CommonFunctionService) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.user_id = localStorage.getItem('user-id');

    if (sessionStorage.getItem('token')) {
      var endpoint;
      if (this.userDetails.roles[0] == 'admin') {
        endpoint = 'getAllApprovedTasks';
      } else {
        endpoint = 'getAllApprovedTasks/user/' + this.user_id;
      }
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', endpoint, null).subscribe((respData: any) => {
        if (respData['isError'] == false) {
          this.organizerTask = respData['result'];

          this.organizerTask?.forEach(element => {
            if (element?.image && element?.image != null) {
              let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'task');
              element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };

              this.commonFunctionService.loadImage(element.token);
            }
          });
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  /**
   * Function is used to active task tab
   * @author  MangoIt Solutions
   */
  onTasks(id: number) {
    $('.tab-pane').removeClass('active');
    $('.nav-link').removeClass('active');
    if (id == 1) {
      this.displayAllTasks = true;
      this.displayPersonalTasks = false;
      this.displayGroupTasks = false;
      this.displayCreatedTasks = false;
      $('#tabs-1').addClass('active');
      $('#head-allTask').addClass('active');
    } else if (id == 2) {
      this.displayAllTasks = false;
      this.displayPersonalTasks = true;
      this.displayGroupTasks = false;
      this.displayCreatedTasks = false;
      $('#tabs-2').addClass('active');
      $('#head-personalTask').addClass('active');
    } else if (id == 3) {
      this.displayAllTasks = false;
      this.displayPersonalTasks = false;
      this.displayGroupTasks = true;
      this.displayCreatedTasks = false;
      $('#tabs-3').addClass('active');
      $('#head-groupTask').addClass('active');
    } else if (id == 4) {
      this.displayAllTasks = false;
      this.displayPersonalTasks = false;
      this.displayGroupTasks = false;
      this.displayCreatedTasks = true;
      $('#tabs-4').addClass('active');
      $('#head-createdTask').addClass('active');
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
