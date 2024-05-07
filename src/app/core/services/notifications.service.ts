import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { CommonFunctionService } from './common-function.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthorizationAccess, CreateAccess, LoginDetails, ParticipateAccess, UserAccess } from '@core/models';
import { appSetting } from '@core/constants';
import { AuthService } from '@core/services/auth.service';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  language: any;
  userDetails: LoginDetails;
  userId: any;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  displayFlag = 'de';
  alluserDetails: { firstname: string; lastname: string }[] = [];
  showNotifications: any[] = [];
  allowAdvertisment: any;
  alluserKeyclockDetails: { firstname: string; lastname: string }[] = [];
  socket: Socket;

  constructor(private authService: AuthService, private lang: LanguageService, private sanitizer: DomSanitizer, private commonFunctionService: CommonFunctionService) {
    this.socket = io(environment.serverUrl);
  }

  getNotifications(section?: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.language = this.lang.getLanguageFile();
      this.userDetails = JSON.parse(localStorage.getItem('user-data'));
      this.userId = this.userDetails.userId;
      this.userAccess = appSetting.role;
      const userRole: string = this.userDetails.roles[0];
      this.createAccess = this.userAccess[userRole].create;
      this.participateAccess = this.userAccess[userRole].participate;
      this.authorizationAccess = this.userAccess[userRole].authorization;
      this.allowAdvertisment = localStorage.getItem('allowAdvertis');
      const self = this;

      // Array to store all promises
      const promises = [];
      this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
        if (respData && respData.length > 0) {
          Object(respData).forEach((val, key) => {
            //this.alluserDetails[val.id] = { firstname: val.firstname, lastname: val.lastname };
            this.alluserKeyclockDetails[val.keycloak_id] = { firstname: val.firstname, lastname: val.lastname };
          });

          if (userRole === 'admin') {
            switch (section) {
              case 'Group':
                promises.push(this.getAllGroupsNotifications());
                break;
              case 'News':
                promises.push(this.getAllNewsNotifications());
                break;
              case 'FAQ':
                promises.push(this.getAllFAQsNotifications());
                break;
              case 'Task':
                promises.push(this.getAllTasksNotifications());
                break;
              case 'Instructor':
                promises.push(this.getAllInstructorsNotifications());
                break;
              case 'Room':
                promises.push(this.getAllRoomsNotifications());
                break;
              case 'Event':
                promises.push(this.getAllEventsNotifications());
                break;
              case 'Course':
                promises.push(this.getAllCoursesNotifications());
                break;
              case 'Survey':
                promises.push(this.getAllSurveysNotifications());
                break;
              case 'Message':
                promises.push(this.getMessageWaitingToApprove());
                break;
              case 'Banners':
                if (this.allowAdvertisment === 0) {
                  promises.push(this.getBanners());
                }
                break;
              default:
                // Push all promises into the array
                promises.push(this.getAllGroupsNotifications());
                promises.push(this.getAllNewsNotifications());
                promises.push(this.getAllFAQsNotifications());
                promises.push(this.getAllTasksNotifications());
                promises.push(this.getAllInstructorsNotifications());
                promises.push(this.getAllRoomsNotifications());
                promises.push(this.getAllEventsNotifications());
                promises.push(this.getAllCoursesNotifications());
                promises.push(this.getAllSurveysNotifications());
                promises.push(this.getMessageWaitingToApprove());

                if (this.allowAdvertisment === 0) {
                  promises.push(this.getBanners());
                }
                break;
            }
          } else if (userRole === 'member_light_admin' || userRole === 'member_light') {
          } else if (userRole !== 'guest') {
            switch (section) {
              case 'Group':
                promises.push(this.getAllGroupsUsersNotifications());
                break;
              case 'News':
                promises.push(this.getAllNewsUsersNotifications());
                break;
              case 'FAQ':
                promises.push(this.getAllFAQsUsersNotifications());
                break;
              case 'Task':
                promises.push(this.getAllTasksUsersNotifications());
                break;
              case 'Instructor':
                promises.push(this.getAllInstructorsUsersNotifications());
                break;
              case 'Room':
                promises.push(this.getAllRoomsUsersNotifications());
                break;
              case 'Event':
                promises.push(this.getAllEventsUsersNotifications());
                break;
              case 'Course':
                promises.push(this.getAllCoursesUsersNotifications());
                break;
              case 'Survey':
                promises.push(this.getAllSurveysUsersNotifications());
                break;
              case 'Banners':
                if (this.allowAdvertisment === 0) {
                  promises.push(this.getBanners());
                }
                break;
              default:
                promises.push(this.getAllGroupsUsersNotifications());
                promises.push(this.getAllNewsUsersNotifications());
                promises.push(this.getAllFAQsUsersNotifications());
                promises.push(this.getAllTasksUsersNotifications());
                promises.push(this.getAllInstructorsUsersNotifications());
                promises.push(this.getAllRoomsUsersNotifications());
                promises.push(this.getAllEventsUsersNotifications());
                promises.push(this.getAllCoursesUsersNotifications());
                promises.push(this.getAllSurveysUsersNotifications());

                // ----------Banners----------
                if (this.allowAdvertisment === 0) {
                  promises.push(this.getBanners());
                }
                break;
            }
          }

          // Wait for all promises to resolve
          Promise.all(promises)
            .then(() => {
              resolve(this.showNotifications);
            })
            .catch(error => {
              reject(error);
            });
        }
      });
    });
  }

  // ----------Admin Roles--------
  getAllGroupsNotifications() {
    this.showNotifications['Group'] = [];
    this.authService.memberSendRequest('get', 'unapprovedGroupNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Group'] = respData.result;
      }
    });
  }

  getAllNewsNotifications() {
    this.showNotifications['News'] = [];
    this.authService.memberSendRequest('get', 'unapprovedNewsNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['News'] = respData.result;
      }
    });
  }

  getAllFAQsNotifications() {
    this.showNotifications['FAQ'] = [];
    this.authService.memberSendRequest('get', 'unapprovedFaqNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['FAQ'] = respData.result;
      }
    });
  }

  getAllInstructorsNotifications() {
    this.showNotifications['Instructor'] = [];
    this.authService.memberSendRequest('get', 'unapprovedInstructorNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Instructor'] = respData.result;
      }
    });
  }

  getAllRoomsNotifications() {
    this.showNotifications['Room'] = [];
    this.authService.memberSendRequest('get', 'UnapprovedRoomsNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Room'] = respData.result;
      }
    });
  }

  getAllEventsNotifications() {
    this.showNotifications['Event'] = [];
    this.authService.memberSendRequest('get', 'unapprovedEventNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Event'] = respData.result;
      }
    });
  }

  getAllSurveysNotifications() {
    this.showNotifications['Survey'] = [];
    this.authService.memberSendRequest('get', 'unapprovedSurveyNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Survey'] = respData.result;
      }
    });
  }

  getAllCoursesNotifications() {
    this.showNotifications['Course'] = [];
    this.authService.memberSendRequest('get', 'unapprovedCourseNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Course'] = respData.result;
      }
    });
  }

  getAllTasksNotifications() {
    this.showNotifications['Task'] = [];
    this.authService.memberSendRequest('get', 'unapprovedTaskNotification', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Task'] = respData.result;
      }
    });
  }

  getMessageWaitingToApprove() {
    this.authService.memberSendRequest('get', 'message/waiting-to-approve', null).subscribe((respData: any) => {
      if (respData && respData.length > 0) {
        let msgNoti: any[] = [];
        respData.forEach(element => {
          if (element && (element.id != null || element.id !== '') && this.userDetails.team_id == element.user.club_id) {
            msgNoti.push({
              id: element.id,
              firstName: this.alluserKeyclockDetails[element.receiver_id]?.firstname,
              lastName: this.alluserKeyclockDetails[element.receiver_id]?.lastname,
              title: element.subject,
              notificationType: 'messageNotifications',
              created_at: element.created_at,
              esdb_id: element.esdb_id,
            });
          }
        });
        this.showNotifications['Message'] = msgNoti;
      }
    });
  }

  getBanners() {
    this.authService.memberSendRequest('get', 'getBannerDetailsForNotification', null).subscribe((respData: any) => {
      if (respData.isError === false) {
        const bannerLists = respData.result.banner;
        if (bannerLists?.length > 0) {
          let bannerData: any;
          bannerLists.forEach((element: any) => {
            element.category = JSON.parse(element.category);
            element.placement = JSON.parse(element.placement);
            element.display = JSON.parse(element.display);
            if (element.banner_image[0]?.banner_image) {
              element.banner_image[0].banner_image = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element.banner_image[0]?.banner_image.substring(20)));
            }
            if (element.redirectLink.includes('https://') || element.redirectLink.includes('http://')) {
              element.redirectLink = element.redirectLink;
            } else {
              element.redirectLink = '//' + element.redirectLink;
            }
            bannerData.push({
              id: element.id,
              bannerName: element.bannerName,
              image: element.banner_image[0].banner_image,
              redirectLink: element.redirectLink,
              description: element.description,
              notificationType: 'banners',
              created_at: element.created_at,
            });
          });
          this.showNotifications['Banner'] = bannerData;
        }
      }
    });
  }

  // ----------others Roles--------
  getAllNewsUsersNotifications() {
    this.showNotifications['News'] = [];
    this.authService.memberSendRequest('get', 'newsNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['News'] = respData.result;
      }
    });
  }

  getAllFAQsUsersNotifications() {
    this.showNotifications['FAQ'] = [];
    this.authService.memberSendRequest('get', 'faqNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['FAQ'] = respData.result;
      }
    });
  }

  getAllRoomsUsersNotifications() {
    this.showNotifications['Room'] = [];
    this.authService.memberSendRequest('get', 'roomsNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Room'] = respData.result;
      }
    });
  }

  getAllGroupsUsersNotifications() {
    this.showNotifications['Group'] = [];
    this.authService.memberSendRequest('get', 'groupNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Group'] = respData.result;
      }
    });
  }

  getAllInstructorsUsersNotifications() {
    this.showNotifications['Instructor'] = [];
    this.authService.memberSendRequest('get', 'instructorNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Instructor'] = respData.result;
      }
    });
  }

  getAllEventsUsersNotifications() {
    this.showNotifications['Event'] = [];
    this.authService.memberSendRequest('get', 'eventNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Event'] = respData.result;
      }
    });
  }

  getAllSurveysUsersNotifications() {
    this.showNotifications['Survey'] = [];
    this.authService.memberSendRequest('get', 'surveyNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Survey'] = respData.result;
      }
    });
  }

  getAllCoursesUsersNotifications() {
    this.showNotifications['Course'] = [];
    this.authService.memberSendRequest('get', 'courseNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Course'] = respData.result;
      }
    });
  }

  getAllTasksUsersNotifications() {
    this.showNotifications['Task'] = [];
    this.authService.memberSendRequest('get', 'taskNotificationForUser', null).subscribe((respData: any) => {
      if (respData.result?.length > 0) {
        this.showNotifications['Task'] = respData.result;
      }
    });
  }
}
