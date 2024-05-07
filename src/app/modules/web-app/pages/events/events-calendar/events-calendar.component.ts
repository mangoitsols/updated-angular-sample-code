import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RRule } from 'rrule';
import { Subscription } from 'rxjs';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CreateAccess, EventsType, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, WeekdaysService } from '@core/services';
import { appSetting } from '@core/constants';
declare var $: any;

export const MY_DATE_FORMATS = {
  display: {
    monthYearLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  selector: 'app-events-calendar',
  templateUrl: './events-calendar.component.html',
  styleUrls: ['./events-calendar.component.css'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }, DatePipe],
})
export class EventsCalendarComponent implements OnInit {
  language: any;
  setTheme: ThemeType;
  userRole: string;
  date: Date;
  eventTypeList: { name: string; class: string }[] = [];
  eventTypeVisibility: { name: string }[] = [];
  userDetails: LoginDetails;
  all_events: any[] = [];
  todays_date: any;
  eventList: EventsType[] = [];
  currentEvent: EventsType[] = [];
  currentEventList: EventsType[] = [];
  upcomingEvent: EventsType[] = [];
  upcomingEventList: EventsType[] = [];
  private activatedSub: Subscription;
  calendarBtn: boolean = false;
  visibilityDropdownList: { item_id: number; item_text: string }[] = [];
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  selectedDate: any;
  clickedDateEvents: any[] = [];
  courseData: any[];
  allCourses: any[];
  courseList: any[] = [];
  allData: any[] = [];
  dateFilter = false;
  filterSelectedValue: any;
  selected = '0';
  currentUrl: string;
  filterOpt: boolean = false;
  headline_word_option: number = 0;
  minDate: Date;
  maxDate: Date;
  selectedView: string = 'tile-view';

  eventTypeDropdownList: { item_id: number; item_text: string }[] = [];
  monthDropdownList: { item_id: number; name: string }[] = [];
  allEventsList: any[] = [];
  currentPageNumber: number = 1;
  totalPages: any;
  itemPerPage: number = 8;
  pagesArray: number[] = [];
  years: any[] = [];
  selectedYear: any | null = null;
  selectedMonth: number = null;
  selectedEventType: any = null;
  isData: boolean = false;

  viewDropDownItems: any = [];
  typeDropDownItems: any = [];
  monthDropDownItems: any = [];

  // Generate months for the third dropdown
  months: { name: string; value: number }[] = Array.from({ length: 12 }, (_, index) => ({
    name: new Date(0, index).toLocaleString('en-US', { month: 'long' }),
    value: index + 1,
  }));
  actualAllEventsList: any[];
  filteredEventsList: any[] = []; // Array to store filtered events

  constructor(
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private lang: LanguageService,
    private themes: ThemeService,
    private route: ActivatedRoute,
    private commonFunctionService: CommonFunctionService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private weekDayService: WeekdaysService
  ) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.viewDropDownItems = [
      {
        id: 'tile-view',
        name: this.language.club_events.tile_view,
      },
      {
        id: 'list-view',
        name: this.language.club_events.list_view,
      },
    ];

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 1, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 2);
    // for year's dropdown
    this.years.push('All');
    for (let i = 0; i < 5; i++) {
      this.years.push(currentYear + i);
    }

    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.currentUrl = this.router.url;
    if (this.currentUrl == '/web/clubwall/club-events') {
      this.filterOpt = false;
    } else {
      this.filterOpt = true;
    }
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
    this.userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[this.userRole].create;
    this.participateAccess = this.userAccess[this.userRole].participate;
    if (sessionStorage.getItem('token')) {
      this.eventTypeList[1] = { name: this.language.create_event.club_event, class: 'club-event-color' };
      this.eventTypeList[2] = { name: this.language.create_event.group_event, class: 'group-event-color' };
      this.eventTypeList[3] = { name: this.language.create_event.functionaries_event, class: 'functionaries-event-color' };
      this.eventTypeList[4] = { name: this.language.create_event.course_event, class: 'courses-event-color' };
      this.eventTypeList[5] = { name: this.language.create_event.seminar, class: 'seminar-event-color' };
      this.eventTypeList[6] = { name: this.language.create_event.courses, class: 'courses-event-color' };

      (this.eventTypeVisibility[1] = { name: this.language.create_event.public }),
        (this.eventTypeVisibility[2] = { name: this.language.create_event.private }),
        (this.eventTypeVisibility[3] = { name: this.language.create_event.group }),
        (this.eventTypeVisibility[4] = { name: this.language.create_event.club });
      let cudate: Date = new Date();
      let cuday: string = cudate.getDate().toString().padStart(2, '0');
      let cumonth: string = (cudate.getMonth() + 1).toString().padStart(2, '0');
      let cuyear: number = cudate.getFullYear() + 1;
      let nextYear: string = cuyear + '' + cumonth + '' + cuday + 'T000000Z;';
      this.currentEvent = [];
      this.upcomingEvent = [];

      let userId: string = localStorage.getItem('user-id');
      this.authService.setLoader(true);
      let eventUrl: string;
      if (this.userRole == 'guest') {
        eventUrl = 'openevents/';
      } else {
        eventUrl = 'approvedEvents/user/' + userId;
      }
      this.authService.memberSendRequest('get', eventUrl, null).subscribe((respData: any) => {
        if (respData?.length > 0) {
          this.isData = true;
        }
        this.authService.setLoader(false);
        this.date = new Date(); // Today's date
        this.todays_date = this.datePipe.transform(this.date, 'yyyy-MM-dd');

        respData.forEach((elem: any) => {
          this.all_events.push(elem);
          let tokenUrl = this.commonFunctionService.genrateImageToken(elem?.id, 'event');
          elem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(elem.token);
        });

        var element: any = null;
        for (var key in this.all_events) {
          if (this.all_events.hasOwnProperty(key)) {
            element = this.all_events[key];

            if (element?.recurrence && element?.recurrence != '' && element?.recurrence != null) {
              let recurrence: string = element.recurrence;
              if (recurrence.includes('UNTIL') == false) {
                recurrence = recurrence + ';UNTIL=' + nextYear;
              }
              recurrence = recurrence.replace('T000000Z;', 'T200000Z;');
              recurrence = recurrence.slice(0, -1);
              let rule: RRule = RRule.fromString(recurrence);
              let rules: Date[] = rule.all();

              if (rules && rules.length > 0) {
                rules.forEach((val, index) => {
                  let yourDate: Date = new Date(val);
                  let dt: string = yourDate.toISOString().split('T')[0];
                  let recurring_dates = JSON.parse(element.recurring_dates);

                  var recurring_time: any;
                  var recurring_etime: any;
                  if (recurring_dates) {
                    recurring_time = this.commonFunctionService.formatTime(recurring_dates[0].start_time);
                    recurring_etime = this.commonFunctionService.formatTime(recurring_dates[0].end_time);
                  } else {
                    recurring_time = element.date_from.split('T')['1'];
                    recurring_etime = element.date_to.split('T')['1'];
                  }
                  let rrDate: string = dt + 'T' + recurring_time;
                  let rrDateEnd: string = element.date_to.split('T')['0'] + 'T' + recurring_etime;
                  // if (element.visibility != 2) {}
                  this.pushCommonFunction(element, rrDate, rrDateEnd, dt, element.type);
                });
              }
            } else {
              if (element && element.recurring_dates != '' && element.recurring_dates != null) {
                JSON.parse(element.recurring_dates).forEach((dd: any, index: any) => {
                  let yourDate1: Date = new Date(dd.date_from);
                  let dt1: string = yourDate1.toISOString().split('T')[0];
                  let recurring_dates = JSON.parse(element.recurring_dates);
                  var recurring_time: any;
                  var recurring_etime: any;
                  if (recurring_dates) {
                    recurring_time = this.commonFunctionService.formatTime(recurring_dates[index].start_time);
                    recurring_etime = this.commonFunctionService.formatTime(recurring_dates[index].end_time);
                  } else {
                    recurring_time = element.date_from.split('T')['1'];
                    recurring_etime = element.date_to.split('T')['1'];
                  }
                  let rrDate1: string = dt1 + 'T' + recurring_time;
                  let rrDateEnd1: string = dt1 + 'T' + recurring_etime;
                  // if (element.visibility != 2) {}
                  this.pushCommonFunction(element, rrDate1, rrDateEnd1, dt1, element.type);
                });
              } else {
                const dates: Date[] = this.commonFunctionService.getDates(new Date(element?.date_from), new Date(element.date_to));
                if (dates && dates.length > 0) {
                  dates.forEach(dd => {
                    let yourDate1: Date = new Date(dd);
                    let dt1: string = yourDate1.toISOString().split('T')[0];
                    let recurring_dates = JSON.parse(element.recurring_dates);
                    var recurring_time: any;
                    var recurring_etime: any;
                    if (recurring_dates) {
                      recurring_time = this.commonFunctionService.formatTime(recurring_dates[0].start_time);
                      recurring_etime = this.commonFunctionService.formatTime(recurring_dates[0].end_time);
                    } else {
                      recurring_time = element.date_from.split('T')['1'];
                      recurring_etime = element.date_to.split('T')['1'];
                    }
                    let rrDate1: string = dt1 + 'T' + recurring_time;
                    let rrDateEnd1: string = element.date_to.split('T')['0'] + 'T' + recurring_etime;
                    // if (element.visibility != 2) {}
                    this.pushCommonFunction(element, rrDate1, rrDateEnd1, dt1, element.type);
                  });
                }
              }
            }
          }
        }
        this.currentEventList.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));
        this.currentEvent.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));

        this.onDateClick(this.todays_date);
        const currentRoute = this.router.url;
        if (this.allEventsList.length == 0 && currentRoute == '/web/clubwall/club-events') {
          this.isData = false;
        }
      });
    }

    this.typeDropDownItems = [
      { id: 0, name: 'All' },
      { id: 1, name: this.language.create_event.club_event },
      { id: 2, name: this.language.create_event.group_event },
      { id: 3, name: this.language.create_event.functionaries_event },
      { id: 4, name: this.language.create_event.courses },
      { id: 5, name: this.language.create_event.seminar },
    ];

    this.monthDropDownItems = [
      { id: 0, name: 'All' },
      { id: 1, name: this.language.club_events.january },
      { id: 2, name: this.language.club_events.february },
      { id: 3, name: this.language.club_events.march },
      { id: 4, name: this.language.club_events.april },
      { id: 5, name: this.language.club_events.may },
      { id: 6, name: this.language.club_events.june },
      { id: 7, name: this.language.club_events.july },
      { id: 8, name: this.language.club_events.august },
      { id: 9, name: this.language.club_events.september },
      { id: 10, name: this.language.club_events.october },
      { id: 11, name: this.language.club_events.november },
      { id: 12, name: this.language.club_events.december },
    ];

    this.eventTypeDropdownList = this.weekDayService.eventTypeDropdownList();

    this.monthDropdownList = [
      { item_id: 1, name: this.language.club_events.january },
      { item_id: 2, name: this.language.club_events.february },
      { item_id: 3, name: this.language.club_events.march },
      { item_id: 4, name: this.language.club_events.april },
      { item_id: 5, name: this.language.club_events.may },
      { item_id: 6, name: this.language.club_events.june },
      { item_id: 7, name: this.language.club_events.july },
      { item_id: 8, name: this.language.club_events.august },
      { item_id: 9, name: this.language.club_events.september },
      { item_id: 10, name: this.language.club_events.october },
      { item_id: 11, name: this.language.club_events.november },
      { item_id: 12, name: this.language.club_events.december },
    ];
  }

  isOrganizerRoute(): boolean {
    // Check if the current route is '/clubwall/club-events'
    return this.router.url === '/web/organizer';
  }

  isOrganizerEventsRoute(): boolean {
    // Check if the current route is '/clubwall/club-events'
    return this.router.url === '/web/organizer/organizer-event';
  }

  /**
   * Function to push value in currentEvent and upcomingEvent
   * @author  MangoIt Solutions (T)
   * @param   {selected date}
   * @return  {array of object} Events of given date
   */
  pushCommonFunction(element: any, rrDate: any, rrDateEnd: any, dt1: any, type: any) {
    const approvedEventUsers = element?.eventUsers?.filter((user: any) => user.approved_status === 1);
    let rrEvents1: any = {
      id: element.id,
      type: type,
      name: element.name,
      // picture_video: element.event_images && element.event_images[0] && element.event_images[0].event_image ? element.event_images[0].event_image : element.course_image && element.course_image[0] && element.course_image[0].course_image,
      picture_video: element.token,
      date_from: rrDate,
      date_to: rrDateEnd,
      description: element.description,
      start_time: element.start_time,
      end_time: element.end_time,
      isCourse: false,
      show_guest_list: element.show_guest_list,
      visibility: element.visibility,
      place: element.place,
      approvedEventUsers: approvedEventUsers,
    };
    this.eventList.push(rrEvents1);

    if (dt1 == this.todays_date) {
      this.currentEvent.push(rrEvents1);
      this.currentEventList.push(rrEvents1);
    } else if (dt1 > this.todays_date) {
      this.upcomingEvent.push(rrEvents1);
      this.upcomingEventList.push(rrEvents1);
    }
    //New array combining currentEvent and upcomingEvent
    this.allEventsList = this.actualAllEventsList = [...this.currentEvent, ...this.upcomingEvent];

    const currentRoute = this.router.url;
    this.allEventsList = this.allEventsList.filter(event => {
      if (currentRoute == '/web/clubwall/club-events') {
        return event.type === '1'; // for this route only club-events are being displayed
      } else {
        return true;
      }
    });

    this.allEventsList.sort((a, b) => {
      const dateA = new Date(a.date_from).getTime();
      const dateB = new Date(b.date_from).getTime();
      return dateA - dateB;
    });
    this.updatePagesArray();
  }

  applyTypeFilters(event: any) {
    this.selectedEventType = event.id;
    this.applyFilters();
  }

  applyMonthFilters(event: any) {
    this.selectedMonth = event.id;
    this.applyFilters();
  }

  applyYearFilters(event: any) {
    this.selectedYear = event;
    this.applyFilters();
  }

  applyViewFilters(event: any) {
    this.selectedView = event.id;
  }

  applyFilters() {
    this.currentPageNumber = 1; // Reset to the first page when changing items per page
    this.allEventsList = this.actualAllEventsList;

    this.filteredEventsList = this.allEventsList;

    // Filter by Year
    if (this.selectedYear && this.selectedYear !== 'All') {
      this.filteredEventsList = this.filteredEventsList.filter(event => new Date(event.date_from).getFullYear() === +this.selectedYear);
    }

    // Filter by Month
    if (this.selectedMonth) {
      this.filteredEventsList = this.filteredEventsList.filter(event => new Date(event.date_from).getMonth() === +this.selectedMonth - 1);
    }

    // Filter by Event Type
    if (this.selectedEventType !== null && this.selectedEventType != 0) {
      this.filteredEventsList = this.filteredEventsList.filter(event => event.type == this.selectedEventType);
    }
    this.allEventsList = this.filteredEventsList;
    this.filteredEventsList.sort((a, b) => {
      const dateA = new Date(a.date_from).getTime();
      const dateB = new Date(b.date_from).getTime();

      // Sorting in descending order
      return dateA - dateB;
    });
    if (this.filteredEventsList.length == 0) {
      this.isData = false;
    } else {
      this.isData = true;
    }
    this.updatePagesArray();
  }

  get pagedEvents() {
    this.itemPerPage = Number(this.itemPerPage);
    const startIndex = (this.currentPageNumber - 1) * this.itemPerPage;
    const endIndex = startIndex + this.itemPerPage;

    return this.allEventsList.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPageNumber < this.totalPages) {
      this.currentPageNumber++;
      this.updatePagesArray();
    }
  }

  previousPage() {
    if (this.currentPageNumber > 1) {
      this.currentPageNumber--;
      this.updatePagesArray();
    }
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPageNumber = pageNumber;
      // Call updatePagesArray after changing the current page
      this.updatePagesArray();
    }
  }

  changeItemsPerPage() {
    this.currentPageNumber = 1; // Reset to the first page when changing items per page
    this.updatePagesArray();
  }

  updatePagesArray() {
    let newsTotalRecords = this.allEventsList.length;
    this.totalPages = Math.ceil(newsTotalRecords / this.itemPerPage);

    const maxPagesToShow = 5; // You can adjust this value based on your requirement
    const middlePage = Math.floor(maxPagesToShow / 2);

    let startPage = this.currentPageNumber - middlePage;
    startPage = Math.max(startPage, 1);

    let endPage = startPage + maxPagesToShow - 1;
    endPage = Math.min(endPage, this.totalPages);

    const showEllipsisStart = startPage > 1;
    const showEllipsisEnd = endPage < this.totalPages;

    if (showEllipsisStart) {
      startPage = Math.max(startPage - 1, 1);
    }

    if (showEllipsisEnd) {
      endPage = Math.min(endPage + 1, this.totalPages);
    }

    this.pagesArray = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  /**
   * Function to get events of the  given date
   * @author  MangoIt Solutions (M)
   * @param   {selected date}
   * @return  {array of object} Events of given date
   */
  onDateClick(date: any) {
    this.clickedDateEvents = [];
    this.selectedDate = null;
    if (date) {
      this.selectedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    } else {
      this.selectedDate = this.todays_date;
    }
    this.eventList.forEach((element: any) => {
      if (element.date_from.split('T')[0] == this.selectedDate) {
        if (element.visibility != 2) {
          if (this.userRole == 'guest' && element.show_guest_list == 'true') {
            this.clickedDateEvents.push(element);
          } else {
            this.clickedDateEvents.push(element);
          }
        }
      }
    });
    this.clickedDateEvents.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));
  }

  /**
   * Function to get the data of previous date
   * @author  MangoIt Solutions (M)
   * @param   {selected date}
   * @return  {array of object} Events of given date
   */
  previousClick() {
    var previousDate = new Date(this.todays_date);
    previousDate.setDate(previousDate.getDate() - 1);
    this.todays_date = previousDate;
    this.nextPreviousData();
  }

  /**
   * Function to get the data of next date
   * @authPor  MangoIt Solutions (M)
   * @param   {selected date}
   * @return  {array of object} Events of given date
   */
  nextClick() {
    var nextDate = new Date(this.todays_date);
    nextDate.setDate(nextDate.getDate() + 1);
    this.todays_date = nextDate;
    this.nextPreviousData();
  }

  /**
   * Function to get the data of next an prev date
   * @authPor  MangoIt Solutions (M)
   * @param   {selected date}
   * @return  {array of object} Events of given date
   */
  nextPreviousData() {
    this.currentEvent = [];
    this.currentEventList = [];
    this.eventList.forEach((element: any) => {
      if (this.datePipe.transform(element.date_from, 'yyyy-MM-dd', 'UTC') == this.datePipe.transform(this.todays_date, 'yyyy-MM-dd')) {
        this.currentEvent.push(element);
        if (this.dateFilter == true) {
          if (this.filterSelectedValue == element.type) {
            this.currentEventList.push(element);
          } else if (this.filterSelectedValue == 0) {
            this.currentEventList.push(element);
          }
        }
      }
    });
    this.currentEventList.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));
    this.currentEvent.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));
  }

  /**
   * Function to select the types of Events
   */
  eventFilter(filterValue: any) {
    this.filterSelectedValue = filterValue;
    this.dateFilter = true;
    var todayEventToShow: EventsType[] = [];
    if (this.currentEvent?.length > 0) {
      this.currentEvent.forEach((value, key) => {
        if (value.type == this.filterSelectedValue) {
          todayEventToShow.push(value);
        }
      });
    }

    if (todayEventToShow?.length) {
      this.currentEventList.splice(0, this.currentEventList.length);
      if (todayEventToShow?.length > 0) {
        todayEventToShow.forEach((val, key) => {
          if (this.datePipe.transform(val.date_from, 'yyyy-MM-dd', 'UTC') == this.datePipe.transform(this.todays_date, 'yyyy-MM-dd')) {
            this.currentEventList.push(val);
          }
        });
      }
    } else {
      this.currentEventList.splice(0, this.currentEventList.length);
    }

    if (this.filterSelectedValue == 0) {
      this.currentEventList.splice(0, this.currentEventList.length);
      this.upcomingEventList.splice(0, this.upcomingEventList.length);
      if (this.currentEvent?.length > 0) {
        this.currentEvent.forEach((val, key) => {
          if (this.datePipe.transform(val.date_from, 'yyyy-MM-dd', 'UTC') == this.datePipe.transform(this.todays_date, 'yyyy-MM-dd')) {
            this.currentEventList.push(val);
          }
        });
      }
    }
    this.currentEventList.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));
    this.currentEvent.sort((a: any, b: any) => Number(new Date(a.date_from)) - Number(new Date(b.date_from)));
  }

  /**
   * Function to redirect the user with date parameter
   * Date: 14 Mar 2023
   * @author  MangoIt Solutions (R)
   * @param   {id , date}
   * @return  {}
   */
  viewDetails(id: any, date: any, type: any) {
    if (type == 6) {
      this.router.navigate(['/web/course-detail/' + id], { queryParams: { date: new Date(date).toISOString().split('T')[0] } });
    } else {
      this.router.navigate(['/web/event-detail/' + id], { queryParams: { date: new Date(date).toISOString().split('T')[0] } });
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
