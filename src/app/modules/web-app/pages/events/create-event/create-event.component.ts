import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, UntypedFormArray, MinValidator, FormControl, FormArray } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { RRule } from 'rrule';
import { NgxImageCompressService } from 'ngx-image-compress';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { LoginDetails, Room, ThemeType, UserDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService, WeekdaysService } from '@core/services';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;
@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
  providers: [DatePipe],
})
export class CreateEventComponent implements OnInit, OnDestroy {
  language: any;
  eventPriceDisplay: boolean = false;
  responseMessage: string = null;
  eventForm: UntypedFormGroup;
  eventSubmitted: boolean = false;
  file: File;
  fileToReturn: File;
  checkNum: boolean = false;
  isCustom: boolean = false;
  recurrenceDropdownField: boolean = false;
  endDateRepeat: boolean = false;
  userDetails: LoginDetails;
  alluserDetails: UserDetails[] = [];
  userSelected: number[] = [];
  recurrenceSelected: number = 0;
  roomSelected: number = null;
  customRecurrenceTypeSelected: number;
  weekDayTypeSelected: number[] = [];
  datearr: number[] = [];
  datearrcustom: number[] = [];
  recurrenceString: string = '';
  setTheme: ThemeType;
  visibility: number;
  type: number;
  untilString: string = '';
  todayName: string;
  finalCustomRecurrence: string;
  instrucType: number;
  romData: Room[] = [];
  selectedRoom: Room;
  mustMatchs: number;
  teamId: number;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  naturalNumber: boolean = true;
  checkPric: boolean = false;
  eventTypeDropdownSettings: IDropdownSettings;
  visibilityDropdownSettings: IDropdownSettings;
  userDropdownSettings: IDropdownSettings;
  roomDropdownSettings: IDropdownSettings;
  groupDropdownSettings: IDropdownSettings;
  customRecurrenceDropdownSettings: IDropdownSettings;
  weekDayDropdownSettings: IDropdownSettings;
  instuctorTypeDropdownSettings: IDropdownSettings;
  externalDropdownSettings: IDropdownSettings;
  internalDropdownSettings: IDropdownSettings;
  recurrenceDropdownSettings: IDropdownSettings;
  visibilityDropdownList: { item_id: number; item_text: string }[] = [];
  eventTypeDropdownList: { item_id: number; item_text: string }[] = [];
  customRecurrenceDropdownList: { item_id: number; item_text: string }[] = [];
  recurrenceDropdownList: { item_id: number; item_text: string }[] = [];
  userDropdownList: { id: number; name: string }[] = [];
  roomDropdownList: { id: number; name: string }[] = [];
  groupUserList: { user_id: string; approved_status: number }[] = [];
  weekDayDropdownList: { item_id: number; description: string }[] = [];
  externalInstructorList: { id: number; name: string }[] = [];
  instuctorTypeDropdownList: { item_id: number; item_text: string }[] = [];
  weekDaysArr: { item_id: number; description: string }[] = [];
  internalInstructor: { user_id: string }[] = [];
  externalInstructor: { instructor_id: number }[] = [];
  recurrenceType: { item_id: number; description: string }[] = [];
  group_dropdown: { group_id: number; name: string }[] = [];
  breadCrumbItems: Array<BreadcrumbItem>;
  isDateInputFocused: boolean = false;

  private activatedSub: Subscription;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    translate: 'no',
    fonts: [{ class: 'gellix', name: 'Gellix' }],
    toolbarHiddenButtons: [
      [
        'link',
        'unlink',
        'subscript',
        'superscript',
        'insertUnorderedList',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
        'insertImage',
        'insertVideo',
        'italic',
        'fontSize',
        'undo',
        'redo',
        'underline',
        'strikeThrough',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'heading',
        'textColor',
        'backgroundColor',
        'customClasses',
        'insertOrderedList',
        'fontName',
      ],
    ],
    sanitize: true,
    toolbarPosition: 'top',
    defaultFontName: 'Arial',
    defaultFontSize: '2',
    defaultParagraphSeparator: 'p',
  };
  isImage: boolean = false;
  isTaskField: boolean = false;
  type_dropdown: { id: number; name: string }[] = [];
  typeDropdownSettings: IDropdownSettings;
  type_visibility: number;
  showUsers: boolean;
  participantSelectedToShow: { id: number; user_name: string }[] = [];
  user_dropdown: { id: number; user_email: string; user_name: string }[] = [];
  participantDropdownSettings: IDropdownSettings;
  participantSelectedItem: number[] = [];
  task_user_selected: any[] = [];
  task_group_dropdown: any[];
  taskgroupDropdownSettings: IDropdownSettings;
  errorDateTask = { isError: false, errorMessage: '' };
  imgHeight: any;
  imgWidth: any;
  selectLanguage: string;
  calendarRooms: any[] = [];
  roomsByIdData: any;
  matchDateError: any = { isError: false, errorMessage: '' };
  event_allDates: any[];
  todays_date: string;
  date: Date;
  allRoomCalndr: any[];
  customReccDateError: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };

  tagsName: any[] = [];
  tagCtrl = new FormControl('');
  filteredTags: Observable<any[]>;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  allTags: any[] = [];
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: any;
  removable = true;
  eventDateError: { isError: boolean; errorMessage: string; index: string };
  imageFile: File;
  socket: Socket;
  showFileName: boolean = true;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private lang: LanguageService,
    private themes: ThemeService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
    private datePipe: DatePipe,
    private renderer: Renderer2,
    private weekDayService: WeekdaysService
  ) {}

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }

    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    $('#date_end').on('keypress', (e: any) => {
      // e.preventDefault();
    });

    $('#date_start').on('keypress', (e: any) => {
      // e.preventDefault();
    });

    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = this.userDetails.team_id;
    this.language = this.lang.getLanguageFile();
    this.selectLanguage = localStorage.getItem('language');
    if (this.selectLanguage == 'sp') {
      this.selectLanguage = 'es';
    }
    this.getUserAndGroup();
    let userId: any = localStorage.getItem('user-id');

    this.eventTypeDropdownList = this.weekDayService.eventTypeDropdownList();
    this.visibilityDropdownList = this.weekDayService.visibilityDropdownList();
    this.customRecurrenceDropdownList = this.weekDayService.customRecurrenceDropdownList();
    this.recurrenceDropdownList = this.weekDayService.recurrenceDropdownList();
    this.weekDaysArr = this.weekDayService.weekDaysArr();
    this.weekDayDropdownList = this.weekDayService.weekDayDropdownList();

    this.recurrenceType = [
      { item_id: 0, description: '' },
      { item_id: 1, description: '' },
      { item_id: 2, description: 'FREQ=WEEKLY;WKST=SU;BYDAY=' },
      { item_id: 3, description: 'FREQ=MONTHLY;WKST=SU' },
      { item_id: 4, description: 'FREQ=YEARLY;WKST=SU' },
    ];

    this.type_dropdown = this.weekDayService.type_dropdown();

    this.typeDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
      closeDropDownOnSelection: true,
    };
    this.eventTypeDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.visibilityDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.recurrenceDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.customRecurrenceDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.weekDayDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'description',
      enableCheckAll: false,
    };

    this.groupDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      closeDropDownOnSelection: true,
    };

    this.eventForm = new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required, this.noWhitespace]),
      place: new UntypedFormControl('', [Validators.required, this.noWhitespace]),
      type: new UntypedFormControl('', Validators.required),
      date_from: new UntypedFormControl('', Validators.required),
      date_to: new UntypedFormControl('', Validators.required),
      date_repeat: new UntypedFormControl(''),
      start_time: new UntypedFormControl('', Validators.required),
      end_time: new UntypedFormControl('', Validators.required),
      allowed_persons: new UntypedFormControl('', [Validators.pattern('^[0-9]*$')]),
      room: new UntypedFormControl(''),
      visibility: new UntypedFormControl('', Validators.required),
      recurrence: new UntypedFormControl(''),
      customRecurrence: new UntypedFormControl(''),
      participant: new UntypedFormControl(''),
      show_guest_list: new UntypedFormControl(''),
      chargeable: new UntypedFormControl(''),
      // 'price_per_participant': new UntypedFormControl('', Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")),
      price_per_participant: new UntypedFormControl('', [Validators.pattern('^[0-9]+([,.][0-9]{1,2})?$'), this.currencySymbolValidator()]),
      description: new UntypedFormControl('', Validators.required),
      users: new UntypedFormControl(''),
      author: new UntypedFormControl(userId),
      approved_status: new UntypedFormControl(0),
      participants: new UntypedFormControl('participants'),
      group_ida: new UntypedFormControl(''),
      add_image: new UntypedFormControl('', Validators.required),
      add_docfile: new UntypedFormControl(''),
      isTask: new UntypedFormControl(''),
      eventDate: this.formBuilder.array([
        this.formBuilder.group({
          date_from: ['', Validators.required],
          start_time: ['', Validators.required],
          end_time: ['', Validators.required],
        }),
      ]),
      task: this.formBuilder.array([]),
      roomBookingDates: new UntypedFormControl(''),
      tags: this.formBuilder.array([]),
    });

    this.getAllTags();
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice()))
    );

    this.initBreadcrumb();
  }

  onDateInputFocus() {
    this.isDateInputFocused = true;
    // this.renderer.setAttribute(dateInput, 'type', 'date');
  }

  onDateInputBlur() {
    this.isDateInputFocused = false;
    // this.renderer.setAttribute(dateInput, 'type', 'text');
  }

  currencySymbolValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (typeof value === 'string' && /[€$!@#%^&*]/.test(value)) {
        return { currencySymbol: true };
      }
      return null;
    };
  }

  noWhitespace(control: UntypedFormControl) {
    if (control?.value.length != 0) {
      let isWhitespace: boolean = (control.value || '').trim().length === 0;
      let isValid: boolean = !isWhitespace;
      return isValid ? null : { whitespace: true };
    } else {
      let isValid: boolean = true;
      return isValid ? null : { whitespace: true };
    }
  }

  get f() {
    return this.eventForm.controls;
  }

  get eventDate() {
    return this.eventForm.get('eventDate') as UntypedFormArray;
  }

  get task() {
    return this.eventForm.get('task') as UntypedFormArray;
  }

  /**
   * Function used to check no multiple should be duplicate
   *  @author  MangoIt Solutions
   */
  uniqueDateTimeValidator(eventDates: AbstractControl[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!eventDates || eventDates.length < 2) {
        return null; // No duplicates possible with less than 2 items
      }

      const currentDateTime = control.value;
      const previousDateTime = eventDates[eventDates.length - 2]?.value;

      if (control.value['start_time']) {
        const isDuplicate = eventDates.some(dateControl => {
          return (
            dateControl !== control &&
            this.formatDate(dateControl.get('date_from').value) === this.formatDate(currentDateTime.date_from) &&
            dateControl.get('start_time').value === currentDateTime.start_time &&
            dateControl.get('end_time').value === currentDateTime.end_time
          );
        });
        const isInvalidTime = previousDateTime && new Date(`${currentDateTime.date_from}T${currentDateTime.start_time}:00`) < new Date(`${previousDateTime.date_from}T${previousDateTime.end_time}:00`);

        return isDuplicate || isInvalidTime ? { duplicateDateTime: true } : null;
      }
    };
  }

  /**
   * Function to add More Dates and Times
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {}
   */
  addAvailableTimes() {
    this.recurrenceDropdownField = false;
    this.eventForm.controls['recurrence'].setValue('');
    this.recurrenceString = '';

    if (this.eventForm.get('eventDate').status === 'INVALID') {
      this.eventDateError = { isError: true, errorMessage: 'This is required', index: '' };
    } else {
      this.eventDateError = { isError: false, errorMessage: '', index: '' };
    }

    if (this.errorTime.isError == false) {
      this.errorTime = { isError: false, errorMessage: '', index: '' };
      if (this.eventDate.valid) {
        const newAvailableTimes: UntypedFormGroup = this.formBuilder.group(
          {
            date_from: ['', Validators.required],
            start_time: ['', Validators.required],
            end_time: ['', Validators.required],
          },
          { validators: this.uniqueDateTimeValidator(this.eventForm.get('eventDate')['controls']) }
        );
        this.eventDate.push(newAvailableTimes);
        if (this.eventForm.controls['eventDate'].value.length > 1) {
          this.recurrenceDropdownField = false;
          this.eventForm.controls['recurrence'].setValue('');
          this.eventForm.get('recurrence').clearValidators();
          this.eventForm.get('recurrence').updateValueAndValidity();
          this.eventForm.controls['date_repeat'].setValue('');
          this.eventForm.controls['date_to'].setValue('');
        }
      }
    }
  }

  /**
   * Function to Remove Dates and Times
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {}
   */
  removeAvailableTimes(index) {
    this.errorTime = { isError: false, errorMessage: '', index: '' };
    this.eventDate.removeAt(index);

    if (this.eventForm.controls['eventDate'].value.length == 1) {
      this.eventForm.controls['recurrence'].setValue('');
      this.recurrenceDropdownList = [];
      this.recurrenceDropdownList.push(
        { item_id: 0, item_text: this.language.new_create_event.does_not_repeat },
        { item_id: 1, item_text: this.language.new_create_event.every_day },
        { item_id: 2, item_text: this.language.new_create_event.every_week },
        { item_id: 3, item_text: this.language.new_create_event.every_month },
        { item_id: 4, item_text: this.language.new_create_event.every_year },
        { item_id: 5, item_text: this.language.new_create_event.custom }
      );
      this.recurrenceDropdownField = true;
      this.eventForm.get('recurrence').setValidators(Validators.required);
      this.eventForm.get('recurrence').updateValueAndValidity();
    }
    this.eventForm.controls['date_repeat'].setValue('');
    this.eventForm.get('date_repeat').clearValidators();
    this.eventForm.get('date_repeat').updateValueAndValidity();
    this.endDateRepeat = false;
  }

  checkOnlyNaturalNumber(event: any) {
    let n = event.target.value;
    var result = n - Math.floor(n) !== 0;
    if (n == null || n == '') {
      this.naturalNumber = true;
    } else {
      if (result) {
        this.naturalNumber = true;
      } else if (n && n <= 0) {
        this.naturalNumber = true;
      } else if (n && n > 99) {
        this.naturalNumber = true;
      } else {
        this.naturalNumber = false;
      }
    }
  }

  /**
   * Function is used to check price
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {boolean} true/false
   */
  checkPrice() {
    if (this.eventForm.value['price_per_participant'] == '') {
      this.checkPric = false;
    } else if (this.eventForm.value['price_per_participant'] <= 0) {
      this.checkPric = true;
    } else {
      this.checkPric = false;
    }
  }

  /**
   * Function is used to get user and Groups
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all user and Group list
   */
  getUserAndGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamGroupsAndUsers/' + this.teamId, null).subscribe((respData: any) => {
        if (respData['isError'] == false) {
          this.authService.setLoader(false);
          if (respData && respData?.result?.groups?.length > 0) {
            this.group_dropdown = respData.result.groups;
          }

          if (respData && respData?.result?.users?.length > 0) {
            this.alluserDetails = respData.result.users;
            Object(respData.result.users).forEach((val, key) => {
              if (val.id != localStorage.getItem('user-id') && val.role != 'guest') {
                this.userDropdownList.push({ id: val.id, name: val.firstname + ' ' + val.lastname });
                this.user_dropdown.push({
                  id: val.id,
                  user_email: val.email,
                  user_name: val.firstname + ' ' + val.lastname,
                });
              }
            });

            this.userDropdownSettings = {
              singleSelection: false,
              idField: 'id',
              textField: 'name',
              selectAllText: 'Select All',
              enableCheckAll: true,
              unSelectAllText: 'UnSelect All',
              allowSearchFilter: true,
            };

            this.participantDropdownSettings = {
              singleSelection: false,
              idField: 'id',
              textField: 'user_name',
              allowSearchFilter: true,
              selectAllText: 'Select All',
              enableCheckAll: true,
              unSelectAllText: 'UnSelect All',
              searchPlaceholderText: this.language.header.search,
            };
          }

          if (respData && respData?.result?.rooms?.length > 0) {
            this.romData = respData.result.rooms;
            Object(respData.result.rooms).forEach((val, key) => {
              this.roomDropdownList.push({ id: val.id, name: val.name });
            });
            this.roomDropdownSettings = {
              singleSelection: true,
              idField: 'id',
              textField: 'name',
              enableCheckAll: false,
              closeDropDownOnSelection: true,
            };
          }
        }
      });
    }
  }

  /**
   * Function is used to set event value in form data and send to back end to store event information in db
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {string} message
   */
  eventProcess() {
    if (this.recurrenceSelected == 0) {
      let endDate = (<UntypedFormArray>this.eventForm.get('eventDate')).controls.slice(-1);
      this.eventForm.controls['date_to'].setValue(this.formatDate(endDate[0].value.date_from));
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
    }
    this.eventSubmitted = true;
    this.endRepeat();
    if (this.recurrenceSelected == 5) {
      if (this.finalCustomRecurrence == 'undefined' || this.finalCustomRecurrence == '' || this.finalCustomRecurrence == null) {
        this.customReccDateError = { isError: true, errorMessage: this.language.create_event.select_custom_recc };
      } else {
        this.customReccDateError = { isError: false, errorMessage: this.language.create_event.select_custom_recc };
      }
    }
    if (this.eventForm.valid) {
      if (this.eventForm.controls['task']?.value?.length > 0 && this.task_user_selected?.length > 0) {
        let count = 0;
        this.task_user_selected.forEach((elem: any) => {
          if (elem.user_id == this.eventForm.controls['task'].value[0].organizer_id) {
            count++;
          }
        });

        if (count == 0) {
          this.task_user_selected.push({
            user_id: this.eventForm.controls['task'].value[0].organizer_id,
            approved_status: 1,
          });
        }
        let uniqueTaskUsers = this.authService.uniqueData(this.task_user_selected);
        console.log(this.task_user_selected);

        this.eventForm.controls['task'].value[0].taskCollaborators = uniqueTaskUsers;
        this.eventForm.controls['task'].value[0].date = this.formatDate(this.eventForm.controls['task'].value[0].date);
      }
      this.mustMatchs = this.eventForm.value.allowed_persons;
      if (this.selectedRoom != null && this.mustMatchs != null) {
        if (new Date(this.eventForm.value['date_from']) >= new Date(this.roomsByIdData.active_from) && new Date(this.eventForm.value['date_to']) <= new Date(this.roomsByIdData.active_to)) {
          this.matchDateError = { isError: false, errorMessage: '' };
          var roomsData: any[] = [];
          var event_startTime: any;
          var event_endTime: any;
          var event_recuu: any = '';
          this.date = new Date(); // Today's date
          this.todays_date = this.datePipe.transform(this.date, 'yyyy-MM-dd');
          this.calendarRooms.forEach((elem: any) => {
            if (elem.date_start >= this.todays_date) {
              roomsData.push(elem);
            }
          });
          roomsData.sort((a: any, b: any) => Number(new Date(a.date_start)) - Number(new Date(b.date_start)));

          if (this.recurrenceString && (this.recurrenceString != ' ' || this.recurrenceString != null)) {
            event_recuu = this.recurrenceString;
          } else if (this.finalCustomRecurrence && (this.finalCustomRecurrence != ' ' || this.finalCustomRecurrence != null)) {
            event_recuu = this.finalCustomRecurrence;
          }

          if (event_recuu && (event_recuu != ' ' || event_recuu != null)) {
            //if the recurrence
            event_startTime = this.eventForm.value['start_time'];
            event_endTime = this.eventForm.value['end_time'];
            this.checkRoomAvailability(event_startTime, event_endTime, this.event_allDates, roomsData);
          } else if (this.eventForm.value.eventDate.length > 1) {
            /// if the multiple dates
            this.checkRoomAvailability(event_startTime, event_endTime, this.event_allDates, roomsData);
          } else {
            event_startTime = this.eventForm.value['start_time'];
            event_endTime = this.eventForm.value['end_time']; // no recurrence & no multiple dates
            this.checkRoomAvailability(event_startTime, event_endTime, this.event_allDates, roomsData);
          }
        } else {
          this.notificationService.showError(this.language.create_event.not_room, 'Error');
          this.matchDateError = { isError: true, errorMessage: this.language.create_event.not_room };
        }
      }
    }

    if (this.eventForm.valid && !this.errorTime.isError && !this.errorDate.isError && !this.errorImage.isError && !this.matchDateError.isError && !this.errorDateTask.isError && !this.errorMatch.isError && !this.customReccDateError.isError) {
      this.authService.setLoader(true);
      if (this.roomSelected) {
        this.eventForm.controls['room'].setValue(this.roomSelected);
      } else {
        this.eventForm.controls['room'].setValue(null);
      }
      this.eventForm.controls['type'].setValue(this.type);
      this.eventForm.controls['visibility'].setValue(this.visibility);
      var uniqueUsers = this.authService.uniqueData(this.userSelected);
      this.eventForm.controls['users'].setValue(uniqueUsers);
      var date_from: Date = this.formatDate(this.eventForm.controls['date_from'].value);

      var start_time: number = this.eventForm.controls['start_time'].value;
      var date_to: Date = this.formatDate(this.eventForm.controls['date_to'].value);
      var end_time: number = this.eventForm.controls['end_time'].value;
      this.eventForm.controls['date_from'].setValue(date_from + ' ' + start_time);
      this.eventForm.controls['date_to'].setValue(date_to + ' ' + end_time);
      this.eventForm.controls['date_repeat'].setValue(date_to + ' ' + end_time);
      var date_repeat: Date = this.eventForm.controls['date_repeat'].value;

      var formData: FormData = new FormData();
      this.authService.setLoader(false);
      for (const key in this.eventForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.eventForm.value, key)) {
          const element = this.eventForm.value[key];
          if (key == 'add_image') {
            formData.append('file', element);
          } else if (key == 'add_docfile') {
            formData.append('file', element);
          } else if (key == 'recurrence') {
            if (element[0] && element[0].item_id == 5) {
              formData.append('recurrence', this.finalCustomRecurrence);
            } else {
              formData.append('recurrence', this.recurrenceString);
            }
          } else if (key == 'chargeable') {
            if (element == true) {
              formData.append('chargeable', this.eventForm.controls['price_per_participant'].value);
            }
          } else if (key == 'participant' && element[0] != null) {
            if (element && element.length > 0) {
              element.forEach((value, key) => {
                formData.append('participant[' + key + ']', JSON.stringify(value.id));
              });
            }
          } else if (key == 'group_ida' && element[0] != null) {
            var groupArray: number[] = [];
            var grp_id: number;
            if (element && element.length > 0) {
              element.forEach((value, key) => {
                grp_id = value.id;
                groupArray.push(value.id);
              });
            }
            formData.append('group_id', JSON.stringify(grp_id));
            formData.append('groups', JSON.stringify(groupArray));
          } else if (key == 'users') {
            if (this.visibility != 3) {
              var userArr: { user_id: string; approved_status: number }[] = [{ user_id: JSON.parse(localStorage.getItem('user-id')), approved_status: 1 }];
              if (element && element.length > 0) {
                element.forEach((value, key) => {
                  var status: number = 0;
                  if (value == localStorage.getItem('user-id')) {
                    status = 1;
                  }
                  var userObj: { user_id: string; approved_status: number } = { user_id: value, approved_status: status };
                  userArr.push(userObj);
                });
              }
              let uniqueUsers = this.authService.uniqueData(userArr);
              formData.append('users', JSON.stringify(uniqueUsers));
            } else if (this.visibility == 3 && this.groupUserList != null) {
              let isAuthor = 0;
              if (this.groupUserList && this.groupUserList.length > 0) {
                this.groupUserList.forEach((val: any) => {
                  if (val.user_id == JSON.parse(localStorage.getItem('user-id'))) {
                    isAuthor++;
                  }
                });
              }
              if (isAuthor < 1) {
                this.groupUserList.push({ user_id: JSON.parse(localStorage.getItem('user-id')), approved_status: 1 });
              }
              let uniqueGroupUsers = this.authService.uniqueData(this.groupUserList);
              formData.append('users', JSON.stringify(uniqueGroupUsers));
            }
          } else if (key == 'roomBookingDates') {
            formData.append('roomBookingDates', JSON.stringify(element));
          } else if (key == 'eventDate') {
            element.forEach((ele: any, idn: any) => {
              ele.date_from = this.formatDate(ele.date_from);
            });
            formData.append('eventDate', JSON.stringify(element));
          } else if (key == 'task') {
            formData.append('task', JSON.stringify(element));
          } else if (key == 'tags') {
            formData.append('event_tags', JSON.stringify(element));
          } else {
            if (
              key != 'add_image' &&
              key != 'file' &&
              key != 'users' &&
              key != 'add_docfile' &&
              key != 'participant' &&
              key != 'roomBookingDates' &&
              key != 'chargeable' &&
              key != 'recurrence' &&
              key != 'customRecurrence' &&
              key != 'eventDate' &&
              key != 'task' &&
              key != 'tags'
            ) {
              formData.append(key, element);
            }
          }
        }
      }
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createEvent', formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.eventSubmitted = false;
        // this.userSelected = [];
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'Event', (error: any) => {});
          this.notificationService.showSuccess(this.language.response_message.event_success, 'Success');
          setTimeout(() => {
            this.router.navigate(['web/event-detail/' + respData['result']['news']['id']]);
          }, 1500);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
          this.setVisibilityOnError(this.visibility);
          this.setEventTypeOnError(this.type);
          this.eventForm.controls['date_to'].setValue(date_to);
          this.eventForm.controls['recurrence'].setValue(this.recurrenceSelected);

          this.eventForm.controls['room'].setValue(date_to);
          if (this.selectedRoom) {
            let room_data = [];
            room_data.push({ id: this.selectedRoom.id, name: this.selectedRoom.name });
            this.eventForm.controls['room'].setValue(room_data);
          }
        }
      });
    }
  }

  /**
   * Function is used to set visibility when error is coming
   * @author  MangoIt Solutions
   */
  setVisibilityOnError(id: number) {
    let visibility_data = [];
    if (id == 1) {
      visibility_data.push({ item_id: 1, item_text: this.language.create_event.public });
    } else if (id == 2) {
      visibility_data.push({ item_id: 2, item_text: this.language.create_event.private });
    } else if (id == 3) {
      visibility_data.push({ item_id: 3, item_text: this.language.create_event.group });
    } else if (id == 4) {
      visibility_data.push({ item_id: 4, item_text: this.language.create_event.club });
    }
    this.eventForm.controls['visibility'].setValue(visibility_data);
  }

  /**
   * Function is used to set visibility when error is coming
   * @author  MangoIt Solutions
   */
  setEventTypeOnError(id: number) {
    let type_data = [];
    if (id == 1) {
      type_data.push({ item_id: 1, item_text: this.language.create_event.club_event });
    } else if (id == 2) {
      type_data.push({ item_id: 2, item_text: this.language.create_event.group_event });
    } else if (id == 3) {
      type_data.push({ item_id: 3, item_text: this.language.create_event.functionaries_event });
    } else if (id == 4) {
      type_data.push({ item_id: 4, item_text: this.language.create_event.courses });
    } else if (id == 5) {
      type_data.push({ item_id: 5, item_text: this.language.create_event.seminar });
    }
    this.eventForm.controls['type'].setValue(type_data);
  }

  /**
   * Function is used check the availability of Room for the Event dates
   * @author  MangoIt Solutions
   * @param   {startTime,endTime,course all dates,rooms dates}
   * @return  {Array Of Object} if conditions is correct then room booking dates else error
   */
  checkRoomAvailability(event_startTime: any, event_endTime: any, event_allDates: any, roomsData: any) {
    var count: number = 0;
    var finalEventData: any[] = [];
    var eventRecu: any[] = [];
    var event_dates_length: any;
    if (this.eventForm?.value?.eventDate.length > 1) {
      event_dates_length = this.eventForm.value.eventDate.length;
      this.eventForm.value.eventDate.forEach((elem: any, index: any) => {
        roomsData.forEach((element: any, idn: any) => {
          if (element.classNames == 'room-availability') {
            elem.start_time = this.commonFunctionService.formatTime(elem.start_time);
            elem.end_time = this.commonFunctionService.formatTime(elem.end_time);
            if (element.date_start == this.datePipe.transform(elem.date_from, 'yyyy-MM-dd') && elem.start_time >= element.start.split('T')[1] && elem.end_time <= element.end.split('T')[1]) {
              finalEventData.push(elem);
              count++;
            }
          }
        });
      });
    } else if (event_allDates) {
      event_dates_length = event_allDates.length;
      event_allDates.forEach((elem: any, index: any) => {
        roomsData.forEach((element: any, idn: any) => {
          event_startTime = this.commonFunctionService.formatTime(event_startTime);
          event_endTime = this.commonFunctionService.formatTime(event_endTime);
          if (element.classNames == 'room-availability') {
            if (element.date_start == this.datePipe.transform(elem, 'yyyy-MM-dd') && event_startTime >= element.start.split('T')[1] && event_endTime <= element.end.split('T')[1]) {
              finalEventData.push(elem);
              count++;
            }
          }
        });
      });
    }
    finalEventData = this.authService.uniqueData(finalEventData);
    if (count >= event_dates_length) {
      this.matchDateError = { isError: false, errorMessage: '' };
      if (this.mustMatchs > this.selectedRoom.no_of_persons) {
        this.errorMatch = { isError: true, errorMessage: this.language.courses.room_error };
      } else {
        this.errorMatch = { isError: false, errorMessage: '' };
        if (event_startTime && event_endTime) {
          finalEventData.forEach((element: any, index: any) => {
            event_startTime = this.commonFunctionService.formatTime(event_startTime);
            event_endTime = this.commonFunctionService.formatTime(event_endTime);
            let el_date = element?.date_from ? element.date_from : element;
            eventRecu[index] = {
              date_from: this.datePipe.transform(new Date(el_date), 'YYYY-MM-dd'),
              start_time: event_startTime,
              end_time: event_endTime,
            };
          });
          this.eventForm.controls['roomBookingDates'].setValue(eventRecu);
        } else {
          this.eventForm.controls['roomBookingDates'].setValue(this.eventForm.value.eventDate);
        }
      }
    } else {
      this.notificationService.showError(this.language.create_event.room_not_avail, 'Error');
      this.matchDateError = { isError: true, errorMessage: this.language.create_event.room_not_avail };
    }
  }

  /**
   * Function is used to get today date
   * @author  MangoIt Solutions
   */
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Function is used to get end date
   * @author  MangoIt Solutions
   */
  getEndDate() {
    this.eventForm.controls['date_from'].setValue('');
    this.eventForm.controls['start_time'].setValue('');
    this.eventForm.controls['date_from'].setValue('');
    this.eventForm.controls['date_from'].setValue(this.formatDate(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].date_from));
    this.eventForm.controls['start_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].start_time);
    this.eventForm.controls['end_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].end_time);
    return this.eventForm.controls.date_from.value;
  }

  errorDate: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };

  compareTwoDates(i: any) {
    if (
      this.formatDate(this.eventForm.controls['eventDate'].value[i]) &&
      this.formatDate(this.eventForm.controls['eventDate'].value[i]?.date_from) != '' &&
      this.formatDate(this.eventForm.controls['eventDate'].value[i]) &&
      this.formatDate(this.eventForm.controls['eventDate'].value[i]?.date_to) != ''
    ) {
      if (new Date(this.eventForm.controls['eventDate'].value[i]?.date_to) < new Date(this.eventForm.controls['eventDate'].value[i]?.date_from)) {
        this.errorDate = {
          isError: true,
          errorMessage: this.language.error_message.end_date_greater,
        };
      } else {
        this.errorDate = { isError: false, errorMessage: '' };
      }
    }
  }

  /**
   * Function to select recurrence
   * @author  MangoIt Solutions
   */
  onRecurrenceSelect(item: { item_id: number; item_text: string }) {
    this.recurrenceSelected = item.item_id;
    var today: number = new Date().getDay();

    if (this.weekDaysArr && this.weekDaysArr.length > 0) {
      this.weekDaysArr.forEach((vals, keys) => {
        if (vals.item_id == today) {
          this.todayName = vals.description;
        }
      });
    }
    if (item.item_id == 5) {
      this.isCustom = true;
      setTimeout(() => {
        $('#showPopup').trigger('click');
      }, 300);
    } else {
      this.isCustom = false;
    }
  }

  onRecurrenceDeSelect() {
    this.recurrenceSelected = null;
  }

  errorTime: { isError: boolean; errorMessage: string; index: '' } = { isError: false, errorMessage: '', index: '' };
  compareTwoTimes(i: any) {
    if (this.eventForm.controls?.['eventDate']?.value[i]?.start_time != '' && this.eventForm.controls?.['eventDate']?.value[i]?.end_time != '') {
      if (this.eventForm.controls['eventDate'].value[i]?.start_time >= this.eventForm.controls['eventDate'].value[i]?.end_time) {
        this.errorTime = { isError: true, errorMessage: this.language.error_message.end_time_same, index: i };
      } else {
        this.errorTime = { isError: false, errorMessage: '', index: '' };
      }
    }
  }

  /**
   * Function is used to check the multiple date or recurrence
   * @author  MangoIt Solutions
   */
  dateSubmit() {
    if (this.eventForm.controls['eventDate'].value[0] && this.eventForm.controls['eventDate'].value[0]?.start_time != '') {
      if (this.eventForm.controls['eventDate'].value.length == 1) {
        this.recurrenceDropdownField = true;
      }
    } else {
      this.recurrenceDropdownField = false;
    }
  }

  /**
   * Function is used to update the date
   * @author  MangoIt Solutions
   */
  endRepeat() {
    this.eventForm.controls['date_from'].setValue('');
    this.eventForm.controls['start_time'].setValue('');
    this.eventForm.controls['date_from'].setValue('');
    this.eventForm.controls['date_from'].setValue(this.formatDate(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].date_from));
    this.eventForm.controls['start_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].start_time);
    this.eventForm.controls['end_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].end_time);
    if (this.eventForm.controls.recurrence?.value != '' && this.eventForm.controls.recurrence?.value[0]?.item_id != 0) {
      this.endDateRepeat = true;
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      this.onRecurrence();
    } else {
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      this.endDateRepeat = false;
      this.getEventsAllDates();
    }
  }

  /**
   * Function to create Reccurence
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  onRecurrence() {
    if (this.recurrenceSelected != 5) {
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      let monthDates: any = [];
      if (this.eventForm.controls['eventDate'] && this.eventForm.controls['eventDate'].value.length > 0) {
        this.eventForm.controls['eventDate'].value.sort().forEach(element => {
          monthDates.push(new Date(element.date_from).getDate());
        });
      }

      if (
        this.eventForm.controls.recurrence &&
        this.eventForm.controls.recurrence.value != '' &&
        this.eventForm.controls.recurrence.value != null &&
        this.eventForm.controls.recurrence.value[0] != 0 &&
        this.eventForm.controls.recurrence.value[0] != 5 &&
        this.eventForm.controls.recurrence.value[0] != 1 &&
        this.eventForm.controls.date_repeat.value != ''
      ) {
        if (this.eventForm.controls.recurrence.value[0].item_id == 1) {
          let rule = new RRule({
            freq: RRule.DAILY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
          });
          let recc: string = rule.toString();
          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          this.recurrenceString = reccu + ';' + re;
          this.event_allDates = RRule.fromString(this.recurrenceString).all();
        } else if (this.eventForm.controls.recurrence.value[0].item_id == 2) {
          let rule = new RRule({
            freq: RRule.WEEKLY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
          });
          let recc: string = rule.toString();
          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          this.recurrenceString = reccu + ';' + re;
          this.event_allDates = RRule.fromString(this.recurrenceString).all();
        } else if (this.eventForm.controls.recurrence.value[0].item_id == 3) {
          let rule = new RRule({
            freq: RRule.MONTHLY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
            bymonthday: monthDates,
          });
          let recc: string = rule.toString();
          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          this.recurrenceString = reccu + ';' + re;
          this.event_allDates = RRule.fromString(this.recurrenceString).all();
        } else if (this.eventForm.controls.recurrence.value[0].item_id == 4) {
          let rule = new RRule({
            freq: RRule.YEARLY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
            // 'bymonthday': monthDates
          });
          let recc: string = rule.toString();
          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          this.recurrenceString = reccu + ';' + re;
          this.event_allDates = RRule.fromString(this.recurrenceString).all();
        } else {
          this.recurrenceString = '';
          this.getEventsAllDates();
        }
      } else {
        this.recurrenceString = '';
        this.getEventsAllDates();
      }
    } else {
      this.setCustomRecurrence();
    }
  }

  /**
   * Function is used to select the Recurrence
   * @author  MangoIt Solutions
   */
  onCustomRecurrenceSelect(item: { item_id: number; item_text: string }[]) {
    this.customRecurrenceTypeSelected = item['item_id'];
    this.naturalNumber = true;
    if (item['item_id'] == 2) {
      this.eventForm.addControl('recc_week', this.formBuilder.control(''));
    } else {
      if (this.eventForm.contains('recc_week')) {
        this.eventForm.removeControl('recc_week');
      }
    }
  }

  /**
   * Function is used to select the week
   * @author  MangoIt Solutions
   */
  onWeekDaySelect(item: { item_id: number; description: string }[]) {
    this.weekDayTypeSelected.push(item['item_id']);
  }

  /**
   * Function is used to de select the week
   * @author  MangoIt Solutions
   */
  onWeekDayDeSelect(item: { item_id: number; description: string }) {
    this.weekDayTypeSelected.forEach((value, index) => {
      if (value == item.item_id) {
        this.weekDayTypeSelected.splice(index, 1);
      }
    });
  }

  /**
   * Function to set custom Reccurence
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  setCustomRecurrence() {
    if (this.recurrenceSelected == 5 && this.customRecurrenceTypeSelected) {
      this.eventForm.controls['date_from'].setValue(this.formatDate(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].date_from));
      this.eventForm.controls['start_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].start_time);
      this.eventForm.controls['end_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].end_time);
      let monthDates: any = [];
      if (this.eventForm.controls['eventDate'] && this.eventForm.controls['eventDate'].value.length > 0) {
        this.eventForm.controls['eventDate'].value.sort().forEach(element => {
          monthDates.push(new Date(element.date_from).getDate());
        });
      }
      let recurrenceData: string = '';
      this.recurrenceString = '';
      this.event_allDates = [];
      if (this.customRecurrenceTypeSelected == 1) {
        recurrenceData = '';
        let numberWeek: number = $('.custom_recurrence_daily').val();
        let r_rule = {
          freq: RRule.DAILY,
          dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
          until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
        };
        if (numberWeek > 0 && this.naturalNumber == false) {
          r_rule['interval'] = numberWeek;
        }
        let rule = new RRule(r_rule);
        let recc: string = rule.toString();
        let re: string = recc.slice(0, 25).replace(':', '=');
        let reccu: string = recc.slice(25);
        recurrenceData = reccu + ';' + re;
        this.event_allDates = RRule.fromString(recurrenceData).all();
      }
      if (this.customRecurrenceTypeSelected == 2) {
        recurrenceData = '';
        let numberWeek: number = $('.custom_recurrence_weekly').val();
        //interval
        let byDay: any[] = [];
        if (this.weekDaysArr && this.weekDaysArr.length > 0) {
          this.weekDaysArr.forEach((weekName, weekIndex) => {
            this.weekDayTypeSelected.forEach((weekSelected, key) => {
              if (weekName.item_id == weekSelected) {
                byDay.push(weekName.description);
              }
            });
          });
        }
        //byWeekDay
        let r_rule = {
          freq: RRule.WEEKLY,
          dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
          until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
        };
        if (numberWeek > 0) {
          r_rule['interval'] = numberWeek;
        }

        let rule = new RRule(r_rule);
        var recc: string = rule.toString();

        if (byDay.length > 0) {
          let recc_str: string;
          recc_str = rule.toString().concat(';BYDAY=');
          if (byDay && byDay.length > 0) {
            byDay.forEach((val, key) => {
              recc_str = recc_str.concat(val + ',');
              if (key == byDay.length - 1) {
                recc_str = recc_str.concat(val);
              }
            });
          }
          recc = recc_str;
        }
        let re: string = recc.slice(0, 25).replace(':', '=');
        let reccu: string = recc.slice(25);
        recurrenceData = reccu + ';' + re;
        this.event_allDates = RRule.fromString(recurrenceData).all();
      }
      if (this.customRecurrenceTypeSelected == 3) {
        recurrenceData = '';
        let numberWeek: number = $('.custom_recurrence_monthly').val();
        let r_rule = {
          freq: RRule.MONTHLY,
          dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
          until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
          bymonthday: monthDates,
        };
        if (numberWeek > 0) {
          r_rule['interval'] = numberWeek;
        }
        let rule = new RRule(r_rule);
        let recc: string = rule.toString();
        let re: string = recc.slice(0, 25).replace(':', '=');
        let reccu: string = recc.slice(25);
        recurrenceData = reccu + ';' + re;
        this.event_allDates = RRule.fromString(recurrenceData).all();
      } else if (this.customRecurrenceTypeSelected == 4) {
        recurrenceData = '';
        let numberWeek: number = $('.custom_recurrence_yearly').val();
        let r_rule = {
          freq: RRule.YEARLY,
          dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
          until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
          // 'bymonthday': monthDates
        };
        if (numberWeek > 0) {
          r_rule['interval'] = numberWeek;
        }
        let rule = new RRule(r_rule);
        let recc: string = rule.toString();
        let re: string = recc.slice(0, 25).replace(':', '=');
        let reccu: string = recc.slice(25);
        recurrenceData = reccu + ';' + re;
        this.event_allDates = RRule.fromString(recurrenceData).all();
      }
      this.finalCustomRecurrence = recurrenceData;
    }
  }

  customReccModalClose() {
    $('#showPopup').trigger('click');
    this.closeModal();
  }

  getEventsAllDates() {
    var alldates: any[] = [];
    this.event_allDates = [];
    if (this.eventForm.controls.eventDate.value.length > 1) {
      var cour_dates: any[] = [];
      alldates = this.eventForm.controls.eventDate.value;
      alldates.forEach(element => {
        cour_dates.push(new Date(this.formatDate(element.date_from)));
      });
      this.event_allDates = this.authService.uniqueData(cour_dates);
    } else {
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      alldates = this.commonFunctionService.getDates(new Date(this.eventForm.controls.date_from.value), new Date(this.eventForm.controls.date_to.value));
      this.event_allDates = alldates;
    }
  }

  /**
   * Function is used to check numver
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {boolean} true/false
   */
  checkNumber() {
    if (this.eventForm.value['allowed_persons'] == '') {
      this.checkNum = false;
    } else if (this.eventForm.value['allowed_persons'] <= 0) {
      this.checkNum = true;
    } else {
      this.checkNum = false;
    }
  }

  /**
   * Function is used to select the room
   * @author  MangoIt Solutions
   */
  errorMatch: any = { isError: false, errorMessage: '' };
  onRoomSelect(item: { id: number; name: string }) {
    this.matchDateError = { isError: false, errorMessage: '' };
    this.roomsById(item.id);
    this.roomSelected = item.id;
    if (this.romData?.length > 0) {
      this.romData.forEach(element => {
        if (element.id == item.id) {
          this.selectedRoom = element;
        }
      });
    }
    this.eventForm.get('allowed_persons').setValidators(Validators.required);
    this.eventForm.get('allowed_persons').updateValueAndValidity();
  }

  /**
   * Function is used to de select the room
   * @author  MangoIt Solutions
   */
  onRoomDeSelect(item: any) {
    this.matchDateError = { isError: false, errorMessage: '' };
    this.calendarRooms = [];
    this.roomSelected = null;
    if (this.romData && this.romData.length > 0) {
      this.romData.forEach(element => {
        if (element.id == item.id) {
          this.selectedRoom = null;
        }
      });
    }
    this.eventForm.get('allowed_persons').clearValidators();
    this.eventForm.get('allowed_persons').updateValueAndValidity();
  }

  /**
   * Function is used to get room by Id
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {object array}
   */
  roomsById(id: number) {
    this.commonFunctionService
      .roomsById(id)
      .then((resp: any) => {
        this.roomsByIdData = resp;
        this.roomsByIdData.active_from = new Date();
        this.roomsByIdData.active_to = new Date(this.roomsByIdData.active_from);
        this.roomsByIdData.active_to.setFullYear(this.roomsByIdData.active_from.getFullYear() + 1);

        this.roomsByIdData.active_from = this.datePipe.transform(this.roomsByIdData.active_from, 'yyyy-MM-dd');
        this.roomsByIdData.active_to = this.datePipe.transform(this.roomsByIdData.active_to, 'yyyy-MM-dd');
        setTimeout(() => {
          this.getRoomCalendar(this.roomsByIdData);
        }, 500);
      })
      .catch((erro: any) => {
        this.notificationService.showError(erro, 'Error');
      });
  }

  /**
   * Function to get the room availability and booked room details
   * @author  MangoIt Solutions(M)
   * @param   {Room data by id}
   * @return  {object array}
   */
  getRoomCalendar(roomsByIdData: any) {
    this.allRoomCalndr = this.commonFunctionService.getRoomCalendar(roomsByIdData);
    this.calendarRooms = this.allRoomCalndr[0].cal;
    this.authService.setLoader(false);
  }

  /**
   * Function to redirect the user with date parameter
   * Date: 14 Mar 2023
   * @author  MangoIt Solutions (R)
   * @param   {id , date}
   * @return  {}
   */
  viewDetails(id: any, date: any, type: any) {
    if (type == 'course') {
      const url = '/course-detail/' + id;
      const queryParams = { date: new Date(date).toISOString().split('T')[0] };
      const queryString = Object.keys(queryParams)
        .map(key => key + '=' + queryParams[key])
        .join('&');
      const fullUrl = url + '?' + queryString;
      // Use window.open() to redirect to the URL in a new tab
      window.open(fullUrl);
    } else {
      const url = '/event-detail/' + id;
      const queryParams = { date: new Date(date).toISOString().split('T')[0] };
      const queryString = Object.keys(queryParams)
        .map(key => key + '=' + queryParams[key])
        .join('&');
      const fullUrl = url + '?' + queryString;
      // Use window.open() to redirect to the URL in a new tab
      window.open(fullUrl);
    }
  }

  closeModal() {}

  onTypeSelect(item: { item_id: number; item_text: string }) {
    this.type = item.item_id;
  }

  /**
   * Function to add dynamically validation as per Visibility Selection
   * @author  MangoIt Solutions
   */
  onVisibilitySelect(item: { item_id: number; item_text: string }) {
    this.visibility = item.item_id;

    this.userSelected = [];
    if (this.visibility == 3) {
      this.eventForm.get('group_ida').setValidators(Validators.required);
      this.eventForm.get('group_ida').updateValueAndValidity();
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
    } else if (this.visibility == 1) {
      this.eventForm.get('participant').setValidators(Validators.required);
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group_ida').clearValidators();
      this.eventForm.get('group_ida').updateValueAndValidity();
    } else if (this.visibility == 2) {
      this.eventForm.get('participant').setValidators(Validators.required);
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group_ida').clearValidators();
      this.eventForm.get('group_ida').updateValueAndValidity();
    } else if (this.visibility == 4) {
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group_ida').clearValidators();
      this.eventForm.get('group_ida').updateValueAndValidity();
      if (this.alluserDetails && this.alluserDetails.length > 0) {
        this.alluserDetails.forEach(element => {
          this.userSelected.push(element.id);
        });
      }
    }
  }

  /**
   * Function is used to change visibility
   * @author  MangoIt Solutions
   */
  changeVisibility() {
    if (this.eventForm.controls.visibility.status == 'INVALID') {
      this.eventForm.controls['group_ida'].setValue('');
      this.eventForm.controls['participant'].setValue('');
      this.visibility = null;
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group_ida').clearValidators();
      this.eventForm.get('group_ida').updateValueAndValidity();
    }
  }

  /**
   * Function is used to select user
   * @author  MangoIt Solutions
   */
  onUserSelect(item: { id: number; name: string }) {
    this.userSelected.push(item.id);
  }

  /**
   * Function is used to de select user
   * @author  MangoIt Solutions
   */
  onUserDeSelect(item: { id: number; name: string }) {
    const index: number = this.userSelected.indexOf(item.id);
    if (index > -1) {
      this.userSelected.splice(index, 1);
    }
  }

  /**
   * Function is used to select all user
   * @author  MangoIt Solutions
   */
  onUserSelectAll(item: { id: number; name: string }[]) {
    this.userSelected = [];
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const element: any = item[key];
        this.userSelected.push(element.id);
      }
    }
  }

  /**
   * Function is used to de select all user
   * @author  MangoIt Solutions
   */
  onUserDeSelectAll(item: any) {
    this.userSelected = [];
  }

  onSelectAll(items: any) {}

  /**
   * Function is used to check event
   * @author  MangoIt Solutions
   */
  eventCheck(event: Event) {
    if (event.target['checked']) {
      this.eventPriceDisplay = true;
    } else {
      this.eventPriceDisplay = false;
    }
  }

  /**
   * Function is used to select group
   * @author  MangoIt Solutions
   */
  onGroupSelect(item: { group_id: number; name: string }) {
    this.userSelected = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + item['id'], null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData.participants) {
        var groupParticipants = respData.participants;
        var groupUsers: { user_id: string; approved_status: number }[] = [];
        if (groupParticipants && groupParticipants.length > 0) {
          groupParticipants.forEach((value, key) => {
            if (value.approved_status == 1) {
              var status: number = 0;
              if (value.user_id == localStorage.getItem('user-id')) {
                status = 1;
              }
              var userGroupObj: { user_id: string; approved_status: number } = { user_id: value.user_id, approved_status: status };
              groupUsers.push(userGroupObj);
            }
          });
        }
        this.groupUserList = groupUsers;
      }
    });
  }

  onCancel() {
    //window.history.back();
    this.router.navigate(['/web/organizer/organizer-event']);
  }

  /**
   * Function is used to validate file type is image and upload images
   * @author  MangoIt Solutions
   * @param   {}
   * @return  error message if file type is not image
   */
  errorImage: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  uploadFile(event: Event) {
    var file: File = (event.target as HTMLInputElement).files[0];
    this.imageFile = file;

    if (file) {
      const mimeType: string = file.type;
      if (mimeType.match(/image\/*/) == null) {
        this.errorImage = { isError: true, errorMessage: this.language.error_message.common_valid };
        this.croppedImage = '';
        this.imageChangedEvent = null;
        $('.preview_txt').hide();
        $('.preview_txt').text('');
        setTimeout(() => {
          this.errorImage = { isError: false, errorMessage: '' };
        }, 3000);
      } else {
        this.errorImage = { isError: false, errorMessage: '' };
        this.fileChangeEvent(event);
      }
    }
  }

  fileChangeEvent(event: Event): void {
    if (event && event.type == 'change') {
      this.croppedImage = '';
      this.imageChangedEvent = null;
      $('.preview_txt').hide();
      $('.preview_txt').text('');
      this.isImage = true;
    }
    this.errorImage = { isError: false, errorMessage: '' };
    this.imageChangedEvent = event;
    this.file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.imgWidth = img.width;
        this.imgHeight = img.height;
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(this.file);
  }

  /**
   * Function is used to cropped and compress the uploaded image
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */

  imageCropped(event: ImageCroppedEvent) {
    let imgData = this.commonFunctionService.getAspectRatio(this.imgHeight, this.imgWidth);
    this.croppedImage = event.base64;
    this.imageCompress
      .compressFile(this.croppedImage, -1, imgData[2], 100, imgData[0], imgData[1]) // 50% ratio, 50% quality
      .then(compressedImage => {
        this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
        this.eventForm.patchValue({ add_image: this.fileToReturn });
        this.eventForm.get('add_image').updateValueAndValidity();
        $('.preview_txt').show(this.fileToReturn.name);
        $('.preview_txt').text(this.fileToReturn.name);
      });
  }

  imageLoaded() {}

  cropperReady() {
    /* cropper ready */
    this.isImage = false;
  }

  loadImageFailed() {
    /* show message */
  }

  errorFile: any = { isError: false, errorMessage: '' };
  uploadFile1(event: Event) {
    $('.preview_txt1').hide();
    $('.preview_txt1').text('');
    this.errorFile = { isError: false, errorMessage: '' };
    const file: File = (event.target as HTMLInputElement).files[0];
    const mimeType: string = file.type;
    const mimeType1: number = file.size;

    if (mimeType1 <= 20000000) {
      if (mimeType.match(/application\/*/) == null && mimeType.match(/text\/*/) == null) {
        this.showFileName = false;
        this.errorFile = { isError: true, errorMessage: this.language.error_message.common_valid };
        this.eventForm.controls['add_docfile'].setValue('');
        setTimeout(() => {
          this.errorFile = { Error: false, errorMessage: '' };
        }, 4000);
        $('.preview_txt1').hide();
        $('.preview_txt1').text('');
      } else {
        this.errorFile = { Error: false, errorMessage: '' };
        this.eventForm.patchValue({
          add_docfile: file,
        });
        this.eventForm.get('add_docfile').updateValueAndValidity();
      }
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      var url: any;
      reader.onload = _event => {
        url = reader.result;
      };
      $('.message-upload-list').show();
      $('.preview_txt1').show();
      $('.preview_txt1').text(file.name);
    } else {
      this.errorFile = { isError: true, errorMessage: this.language.create_message.file_size };
      this.eventForm.controls['add_docfile'].setValue('');
      setTimeout(() => {
        this.errorFile = { isError: false, errorMessage: '' };
      }, 3000);
      this.showFileName = false;
    }
  }

  onTaskSelect() {
    this.isTaskField = !this.isTaskField;
    if (this.isTaskField && this.task && this.task.length < 1) {
      const newAvailableTimes: UntypedFormGroup = this.formBuilder.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        organizer_id: [localStorage.getItem('user-id')],
        status: ['1'],
        group_id: [''],
        groups: [''],
        user_select: [''],
        date: ['', Validators.required],
        type_dropdown: ['', Validators.required],
        taskCollaborators: [''],
      });
      this.task.push(newAvailableTimes);
    } else {
      this.task_user_selected = [];
      this.task.removeAt(0);
    }
  }

  onTaskTypeSelect(item: { id: number; name: string }) {
    this.type_visibility = item.id;
    this.showUsers = false;
    this.participantSelectedToShow = [];
    let control = this.eventForm.controls.task['controls'][0] as UntypedFormGroup;
    control.controls['taskCollaborators'].setValue([]);
    if (this.type_visibility == 1) {
      control.get('groups').setValidators(Validators.required);
      control.get('groups').updateValueAndValidity();
      control.get('user_select').clearValidators();
      control.get('user_select').updateValueAndValidity();
    } else {
      control.controls['group_id'].setValue(0);
      control.get('user_select').setValidators(Validators.required);
      control.get('user_select').updateValueAndValidity();
      control.get('groups').clearValidators();
      control.get('groups').updateValueAndValidity();
    }
  }

  onTaskTypeDeSelect(item: { id: number; name: string }, index) {
    this.type_visibility = null;
    this.showUsers = false;
    this.participantSelectedToShow = [];
  }

  onTaskUserSelect(item: { id: number; user_name: string }) {
    this.showUsers = true;
    this.participantSelectedToShow.push(item);
    this.participantSelectedItem.push(item.id);
    this.task_user_selected.push({
      user_id: item.id,
      approved_status: 1,
    });
  }

  onTaskUserDeSelect(item: { id: number; user_name: string }) {
    if (this.task_user_selected) {
      this.task_user_selected.forEach((value, index) => {
        if (value.user_id == item.id) {
          this.task_user_selected.splice(index, 1);
        }
      });
    }
  }

  onTaskUserSelectAll(items: any[]) {
    this.showUsers = true;

    // Clear previous selections
    this.participantSelectedToShow = [];
    this.participantSelectedItem = [];
    this.task_user_selected = [];

    // Select all users
    items.forEach(item => {
      this.onTaskUserSelect(item);
    });
  }

  onTaskUserDeSelectAll(item: any) {
    this.task_user_selected = [];
  }

  onTaskGroupSelect(item: { id: number; user_name: string }) {
    this.task_user_selected = [];
    let control = this.eventForm.controls.task['controls'][0] as UntypedFormGroup;
    control.controls['group_id'].setValue(item.id);
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + item.id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData?.participants) {
        var groupParticipants = respData?.participants;
        if (groupParticipants && groupParticipants.length > 0) {
          groupParticipants.forEach((value, key) => {
            this.task_user_selected.push({
              user_id: value.user_id,
              approved_status: 1,
            });
          });
        }
      }
    });
  }

  onTaskGroupDeSelect() {
    this.task_user_selected = [];
  }

  taskDateValidate(date: any) {
    var date_from: any;
    var date_to: any;
    if (this.eventForm?.value?.eventDate?.length == 1) {
      if (this.eventForm.controls?.date_to?.value != '') {
        if (this.formatDate(this.eventForm?.value?.eventDate[0]?.date_from) > this.formatDate(date.target.value) || this.formatDate(this.eventForm.controls?.date_to?.value) < this.formatDate(date.target.value)) {
          this.errorDateTask = { isError: true, errorMessage: this.language.error_message.eventTaskDate };
        } else {
          this.errorDateTask = { isError: false, errorMessage: '' };
        }
      }
    } else if (this.eventForm?.value?.eventDate?.length > 1) {
      this.eventForm?.value?.eventDate?.forEach((element: any, index: any) => {
        if (index == 0) {
          date_from = this.formatDate(element.date_from);
        }
        if (this.eventForm?.value?.eventDate.length - 1 === index) {
          date_to = this.formatDate(element.date_from);
        }
        if (this.formatDate(date_from) <= this.formatDate(date.target.value) && this.formatDate(date_to) >= this.formatDate(date.target.value)) {
          this.errorDateTask = { isError: false, errorMessage: '' };
        } else {
          this.errorDateTask = { isError: true, errorMessage: this.language.error_message.eventTaskDate };
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
    this.authService.memberSendRequest('get', 'tags?type=events', null).subscribe((respData: any) => {
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
   * Function is used to add tags
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  addTags(event: MatChipInputEvent): void {
    const formArray: FormArray = this.eventForm.get('tags') as FormArray;
    const value = (event.value || '').trim();

    // Add our tag
    if (value && !this.tagsName.includes(value)) {
      this.tagsName.push(value);
      formArray.push(new FormControl(value));
      formArray.updateValueAndValidity();
    }

    // Clear the input value
    event.chipInput!.clear();
    this.tagCtrl.setValue(null);
  }

  /**
   * Function is used to remove tags
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  remove(tag: string): void {
    const formArray: FormArray = this.eventForm.get('tags') as FormArray;
    const index = this.tagsName.indexOf(tag);
    if (index >= 0) {
      this.tagsName.splice(index, 1);
      formArray.removeAt(index);
      formArray.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event && event.option && event.option.viewValue) {
      const formArray: any = this.eventForm.get('tags') as FormArray;

      if (event.option.viewValue && !this.tagsName.includes(event.option.viewValue)) {
        this.tagsName.push(event.option.viewValue);
        formArray.push(new FormControl(event.option.viewValue));
      }
      this.tagInput.nativeElement.value = '';
      this.tagCtrl.setValue(null);
    }
  }

  private _filter(value: any): any[] {
    if (typeof value == 'string') {
      const filterValue = value.toLowerCase();
      return this.allTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
    } else {
      const filterValue = value.name.toLowerCase();
      return this.allTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
    }
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: this.language.menu.organizer, link: '/web/organizer' }, { label: this.language.community_groups.events }];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }

  private formatDate(date: Date): any {
    // Format the date as yyyy-mm-dd
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
