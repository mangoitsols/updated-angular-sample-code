import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CreateAccess, LoginDetails, Room, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { PaginatedEntity, Pagination } from '@core/entities/_extra/paginated.entity';
import { WeekdaysService } from '@core/services/weekdays.service';
declare var $: any;

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit, OnDestroy {
  language: any;
  userData: LoginDetails;
  responseMessage: string;
  searchSubmit: boolean = false;
  searchForm: UntypedFormGroup;
  displayCourse: boolean;
  displayInstructor: boolean;
  displayRoom: boolean = true;
  setTheme: ThemeType;
  roomImg: string;
  roomsByIdData: Room;
  allRooms: Room[] = [];
  searchData: Room[] = [];
  private activatedSub: Subscription;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  userRole: string;
  thumbnail: any;
  memberid: any;
  currentPageNmuber: number = 1;
  allWeekDayArray: any[];
  allWeekDayArrayName: any[];
  breadCrumbItems: Array<BreadcrumbItem>;
  selectedTag: any;
  selectedIns: string = 'all';
  tags: any;
  allTags: any[] = [];
  pagination: Pagination = new PaginatedEntity().pagination;
  isLoading = true;
  constructor(
    private authService: AuthService,
    private themes: ThemeService,
    private lang: LanguageService,
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
    private notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService,
    private _changeRef: ChangeDetectorRef,
    private weekDayService: WeekdaysService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.initBreadcrumb();

    this.pagination.pageSize = 8;
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.userRole = this.userData.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[this.userRole].create;
    this.getAllRooms(1);
    this.getAllTags();
    this.searchForm = new UntypedFormGroup({
      name: new UntypedFormControl(''),
      persons: new UntypedFormControl('', Validators.pattern('^[0-9]*$')),
    });

    this.allWeekDayArray = this.weekDayService.getAllWeekDayArray();
    this.allWeekDayArrayName = this.weekDayService.getAllWeekDayArrayName();
  }

  /**
   * Function is used to get all rooms
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {object array}
   */
  getAllRooms(item: any) {
    if (sessionStorage.getItem('token')) {
      this.currentPageNmuber = item;
      this.authService.setLoader(true);
      var endPoint = 'getAllRooms?page=' + this.currentPageNmuber + '&pageSize=' + this.pagination.pageSize;
      if (this.selectedTag && this.selectedTag.length > 0) {
        const tagNames = this.selectedTag.map(tag => tag.tag_name).join(',');
        endPoint += '&tags=' + tagNames;
      }
      if (this.selectedIns && this.selectedIns !== 'all') {
        const instructorType = this.selectedIns === 'extern' ? 0 : this.selectedIns === 'intern' ? 1 : null;
        if (instructorType !== null) {
          endPoint += '&instructor_type=' + instructorType;
        }
      }

      this.authService.memberSendRequest('get', endPoint, null).subscribe((respData: Room) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          this.allRooms = respData['result']['room'];
          this.pagination = respData['result'].pagination;
          this._changeRef.markForCheck();
          this.allRooms.forEach((element: any) => {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'room');
            element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.token);
          });
          this.isLoading = false;
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  /**
   * Function is used to get tags data
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all tags
   */
  getAllTags() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'tags?type=room', null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        this.authService.setLoader(false);
        if (respData && respData?.result) {
          this.tags = respData['result'];
          if (this.tags && this.tags.length) {
            this.tags.forEach((val: any, key: any) => {
              this.allTags.push({
                id: val.id,
                name: val.tag_name,
              });
            });
          }
        }
      }
    });
  }

  /**
   * Function is used to get room by Id
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {object array}
   */
  roomsById(id: number) {
    this.roomImg = '';
    this.commonFunctionService
      .roomsById(id)
      .then((resp: any) => {
        this.roomsByIdData = resp;
        if (this.roomsByIdData) {
          let tokenUrl = this.commonFunctionService.genrateImageToken(this.roomsByIdData.id, 'room');
          this.roomsByIdData['token'] = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(this.roomsByIdData['token']);
        }
      })
      .catch((erro: any) => {
        $('#view-rooms').modal('hide');
        this.notificationService.showError(erro, 'Error');
      });
  }

  onCourse() {
    this.displayCourse = true;
    this.displayInstructor = false;
    this.displayRoom = false;
  }

  onInstructor() {
    this.displayCourse = false;
    this.displayInstructor = true;
    this.displayRoom = false;
  }

  onRoom() {
    this.displayCourse = false;
    this.displayInstructor = false;
    this.displayRoom = true;
  }

  updateRooms(id: number) {
    $('#view-rooms').modal('hide');
    var redirectUrl: string = 'web/update-room/' + id;
    this.router.navigate([redirectUrl]);
  }

  /**
   * Function is used delete Room by Id
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {string} success message
   */
  deleteRoom(id: number) {
    $('#view-rooms').modal('hide');
    let roomid: number = id;
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_Room,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteRooms/' + roomid, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          if (respData['isError'] == false) {
            this.notificationService.showSuccess(respData['result']['message'], 'Success');
            setTimeout(() => {
              this.ngOnInit();
            }, 2000);
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
          }
        });
      },
      () => {}
    );
  }

  getDayName(id: any) {
    if (!isNaN(id)) {
      return this.allWeekDayArray[id];
    } else {
      let obj = this.allWeekDayArrayName.find(o => o.name.includes(id));
      if (obj?.name) {
        return this.allWeekDayArray[obj.id];
      } else {
        return id;
      }
    }
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Vereins-Tools', link: '' }, { label: 'Kurse', link: '/web/course' }, { label: this.language.courses.rooms }];
  }

  changePage(pageNumber: number) {
    this.pagination.page = pageNumber;
    this.isLoading = true;
    this.getAllRooms(pageNumber);
  }

  changePageSize(pageSize: number) {
    this.pagination.pageSize = pageSize;
    this.isLoading = true;
    this.getAllRooms(this.pagination.page);
  }

  ngOnDestroy() {
    this.activatedSub.unsubscribe();
  }
}
