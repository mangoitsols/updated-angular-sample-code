import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CreateAccess, LoginDetails, Room, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService } from '@core/services';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css'],
})
export class GlobalSearchComponent implements OnInit {
  language: any;
  responseMessage: string;
  searchSubmit: boolean = false;
  searchForm: UntypedFormGroup;
  displayCourse: boolean;
  displayInstructor: boolean;
  displayRoom: boolean = true;
  setTheme: ThemeType;
  roomImg: string;
  allRooms: Room[] = [];
  roomsByIdData: Room;
  searchData: Room;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  userRole: string;
  searchResult: any;
  userDetails: LoginDetails;
  coursePermission: any;

  constructor(public authService: AuthService, private route: ActivatedRoute, private lang: LanguageService, private notificationService: NotificationService, private commonFunctionService: CommonFunctionService) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    if (this.userDetails['coursePermisssion'].length > 0) {
      this.coursePermission = this.userDetails['coursePermisssion'][0]?.vcloud_isCourse;
    } else {
      this.coursePermission = 0;
    }
    this.route.params.subscribe(params => {
      this.searchData = params.searchValue;
      this.getSearchData();
    });
  }

  getSearchData() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));

      this.authService.memberSendRequest('get', 'globalSearch/' + this.searchData + '/' + userData.team_id + '/' + this.coursePermission, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          this.searchResult = respData['result'];

          if (this.searchResult?.length > 0) {
            this.searchResult.forEach(element => {
              if (element?.event) {
                element.event.forEach(elem => {
                  let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'event');
                  elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                  this.commonFunctionService.loadImage(elem.token);
                });
              }
              if (element?.courses) {
                element.courses.forEach(elem => {
                  let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'course');
                  elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                  this.commonFunctionService.loadImage(elem.token);
                });
              }
              if (element?.survey) {
                element.survey.forEach(elem => {
                  if (elem?.image && elem?.image != '') {
                    let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'survey');
                    elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                    this.commonFunctionService.loadImage(elem.token);
                  }
                });
              }
              if (element?.faq) {
                element.faq.forEach(elem => {
                  if (elem?.image && elem?.image != '') {
                    let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'faq');
                    elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                    this.commonFunctionService.loadImage(elem.token);
                  }
                });
              }
              if (element?.news) {
                element.news.forEach(elem => {
                  let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'news');
                  elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                  this.commonFunctionService.loadImage(elem.token);
                });
              }
              if (element?.groups) {
                element.groups.forEach(elem => {
                  if (elem?.image && elem?.image != '') {
                    let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'group');
                    elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                    this.commonFunctionService.loadImage(elem.token);
                  }
                });
              }
              if (element?.instructor) {
                element.instructor.forEach(elem => {
                  let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'instructor');
                  elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                  this.commonFunctionService.loadImage(elem.token);
                });
              }
              if (element?.task) {
                element.task.forEach(elem => {
                  if (elem?.image && elem?.image != '') {
                    let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'task');
                    elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                    this.commonFunctionService.loadImage(elem.token);
                  }
                });
              }
              if (element?.room) {
                element.room.forEach(elem => {
                  let tokenUrl = this.commonFunctionService.genrateImageToken(elem.id, 'room');
                  elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                  this.commonFunctionService.loadImage(elem.token);
                });
              }
            });
          }
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }
}
