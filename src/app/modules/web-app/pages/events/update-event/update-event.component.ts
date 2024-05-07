import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, UntypedFormArray, AbstractControl, FormControl, FormArray, ValidatorFn } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { RRule, Frequency } from 'rrule';
import { NgxImageCompressService } from 'ngx-image-compress';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { LoginDetails, Room, ThemeType, UserDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService, WeekdaysService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MessaInfoDialogService } from '@shared/components/message-info-dialog/message-info-dialog.service';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-update-event',
  templateUrl: './update-event.component.html',
  styleUrls: ['./update-event.component.css'],
  providers: [DatePipe],
})
export class UpdateEventComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<BreadcrumbItem>;
  language: any;
  eventPriceDisplay: boolean = false;
  hasPicture: boolean = false;
  isCustom: boolean = false;
  checkNum: boolean = false;
  endDateRepeat: boolean = false;
  eventSubmitted: boolean = false;
  recurrenceDropdownField: boolean = false;
  eventForm: UntypedFormGroup;
  responseMessage: string = null;
  eventId: number;
  imageUrl: string;
  fileUrl: string;
  picVid1: File;
  recurrenceSelected: number;
  customRecurrenceTypeSelected: number;
  todayName: string;
  isRecurred: string;
  alluserDetails: UserDetails[] = [];
  finalCustomRecurrence: string;
  untilString: string = '';
  recurrenceString: string = '';
  datearr: number[] = [];
  datearrcustom: number[] = [];
  weekDayTypeSelected: number[] = [];
  visibility: number;
  eventImage: string;
  eventFile: string;
  image: string;
  instrucType: number;
  roomSelected: any = null;
  romData: Room[] = [];
  selectedRoom: Room;
  userDetails: LoginDetails;
  mustMatchs: number;
  teamId: number;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  file: File;
  fileToReturn: File;
  fileAndimage: string[] = [];
  setTheme: ThemeType;
  userSelected: number[] = [];
  eventDetails: any;
  picVid: string;
  aprrovedParticipant: any = [];
  visib: number;
  type: number;
  typerecc: string = '';
  interval: string = '';
  byDay: string = '';
  dateRepeat: string = '';
  checkRecc: boolean = false;
  naturalNumber: boolean = true;
  checkPric: boolean = false;
  recurrenceDropdownSettings: IDropdownSettings;
  customRecurrenceDropdownSettings: IDropdownSettings;
  visibilityDropdownSettings: IDropdownSettings;
  eventTypeDropdownSettings: IDropdownSettings;
  groupDropdownSettings: IDropdownSettings;
  weekDayDropdownSettings: IDropdownSettings;
  userDropdownSettings: IDropdownSettings;
  instuctorTypeDropdownSettings: IDropdownSettings;
  internalDropdownSettings: IDropdownSettings;
  externalDropdownSettings: IDropdownSettings;
  roomDropdownSettings: IDropdownSettings;
  setEventParticipants: { id: number; name: string }[] = [];
  internal: { id: number; name: string }[];
  external: { id: number; name: string }[];
  exitsRoom: any = [];
  groupGet: { id: number; name: string }[] = [];
  eventTypeDropdownList: { item_id: number; item_text: number }[] = [];
  visibilityDropdownList: { item_id: number; item_text: string }[] = [];
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
  group_dropdown: {
    id: any;
    group_id: number;
    name: string;
  }[] = [];
  unapprovedParticipants: { id: any; username: string; firstname: string; lastname: string; email: string }[] = [];
  typereccurenc: any[] = [];
  private activatedSub: Subscription;
  isImage: boolean = false;
  newGroupList: any[] = [];
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
  groups: { id: number; name: string }[];
  setTaskUsers: any[] = [];
  taskStatus: any;
  taskId: any;
  errorDateTask = { isError: false, errorMessage: '' };

  imgHeight: any;
  imgWidth: any;
  selectLanguage: string;
  calendarRooms: any[] = [];
  roomsByIdData: any;
  matchDateError: any = { isError: false, errorMessage: '' };
  event_allDates: Date[] = [];
  todays_date: string;
  date: Date;
  allRoomCalndr: any[];
  customReccDateError: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  result: any;
  documentData: any;
  dowloading: boolean = false;

  tagsName: any[] = [];
  tagCtrl = new FormControl('');
  filteredTags: Observable<any[]>;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  allTags: any[] = [];
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: any;
  removable = true;
  updateType: any = 0;

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
  taskEditorConfig: AngularEditorConfig = {
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
  imageFile: File;
  isDateInputFocused: boolean = false;
  socket: Socket;
  showDownloadBtn: boolean;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private _router: Router,
    private route: ActivatedRoute,
    private lang: LanguageService,
    private themes: ThemeService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private confirmDialogService: ConfirmDialogService,
    private commonFunctionService: CommonFunctionService,
    private sanitizer: DomSanitizer,
    private messageDialog: MessaInfoDialogService,
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
    this.language = this.lang.getLanguageFile();
    this.selectLanguage = localStorage.getItem('language');
    if (this.selectLanguage == 'sp') {
      this.selectLanguage = 'es';
    }
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = this.userDetails.team_id;
    this.getUserAndGroup();
    this.initBreadcrumb();

    this.route.params.subscribe(params => {
      const eventid: number = params['eventId'];
      this.eventId = params['eventId'];
      setTimeout(() => {
        $('.trigger_class').trigger('click');
        $('#clickTrigger').trigger('click');
      }, 5000);
    });
    let userId: string = localStorage.getItem('user-id');

    this.eventTypeDropdownList = this.weekDayService.eventTypeDropdownList();
    this.visibilityDropdownList = this.weekDayService.visibilityDropdownList();
    this.weekDayDropdownList = this.weekDayService.weekDayDropdownList();

    this.weekDayDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'description',
      enableCheckAll: false,
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

    this.recurrenceDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.customRecurrenceDropdownList = this.weekDayService.customRecurrenceDropdownList();

    this.customRecurrenceDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.recurrenceDropdownList = this.weekDayService.recurrenceDropdownList();
    this.weekDaysArr = this.weekDayService.weekDaysArr();
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

    this.eventForm = new UntypedFormGroup({
      name: new UntypedFormControl('', Validators.required),
      place: new UntypedFormControl('', Validators.required),
      type: new UntypedFormControl('', Validators.required),
      date_from: new UntypedFormControl('', Validators.required),
      date_to: new UntypedFormControl('', Validators.required),
      date_repeat: new UntypedFormControl(''),
      start_time: new UntypedFormControl('', Validators.required),
      end_time: new UntypedFormControl('', Validators.required),
      allowed_persons: new UntypedFormControl('', [Validators.pattern('^[0-9]*$')]),
      room: new UntypedFormControl(''),
      visibility: new UntypedFormControl('', Validators.required),
      participant: new UntypedFormControl(''),
      show_guest_list: new UntypedFormControl(''),
      chargeable: new UntypedFormControl(''),
      description: new UntypedFormControl('', Validators.required),
      users: new UntypedFormControl(''),
      author: new UntypedFormControl(userId),
      approved_status: new UntypedFormControl(''),
      participants: new UntypedFormControl('participants'),
      file: new UntypedFormControl(''),
      recurrence: new UntypedFormControl(''),
      group: new UntypedFormControl(''),
      audience: new UntypedFormControl('1'),
      customRecurrence: new UntypedFormControl(''),
      // 'price_per_participant': new UntypedFormControl('', Validators.pattern("^[0-9]*$")),
      price_per_participant: new UntypedFormControl('', [Validators.pattern('^[0-9]+([,.][0-9]{1,2})?$'), this.currencySymbolValidator()]),
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
  }

  onDateInputFocus() {
    this.isDateInputFocused = true;
  }

  onDateInputBlur() {
    this.isDateInputFocused = false;
  }
  get eventDate() {
    return this.eventForm.get('eventDate') as UntypedFormArray;
  }

  get task() {
    return this.eventForm.get('task') as UntypedFormArray;
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
   * @author MangoIt Solutions
   */
  addAvailableTimes() {
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
          this.recurrenceString = '';
          this.checkRecc = false;
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
   * @author MangoIt Solutions
   */
  removeAvailableTimes(index) {
    this.errorTime = { isError: false, errorMessage: '', index: '' };
    this.eventDate.removeAt(index);
    if (this.eventForm.controls['eventDate'].value.length == 1) {
      this.eventForm.controls['recurrence'].setValue('');
      this.weekDaysArr = [];
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
      this.checkRecc = true;
    }
    this.eventForm.controls['date_repeat'].setValue('');
    this.eventForm.get('date_repeat').clearValidators();
    this.eventForm.get('date_repeat').updateValueAndValidity();
    this.endDateRepeat = false;
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

            this.setApprovedParticipantDetails(this.eventId);
            this.setUnapprovedParticipantDetails(this.eventId);
            this.getEventInfo(this.eventId);
          }
        }
      });
    }
  }

  /**
   * Function is used to get Approved Participant Details
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all Approved Participant Details
   */
  setApprovedParticipantDetails(eventid: number) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'approvedParticipants/event/' + eventid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        for (const key in respData) {
          if (Object.prototype.hasOwnProperty.call(respData, key)) {
            const element: any = respData[key];
            this.setEventParticipants.push({ id: element.users.id, name: element.users.firstname + ' ' + element.users.lastname });

            this.userSelected.push(element.users.id);
            this.aprrovedParticipant.push(element.users.id);
          }
        }
        this.setEventParticipants = Object.assign(this.authService.uniqueObjData(this.setEventParticipants, 'id'));

        this.userSelected = this.authService.uniqueData(this.userSelected);
        this.aprrovedParticipant = this.authService.uniqueData(this.aprrovedParticipant);
      });
    }
  }

  /**
   * Function is used to get un Approved Participant Details
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all un Approved Participant Details
   */
  setUnapprovedParticipantDetails(eventid: number) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'unapprovedParticipants/event/' + eventid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        for (const key in respData) {
          if (Object.prototype.hasOwnProperty.call(respData, key)) {
            const element: any = respData[key];
            this.setEventParticipants.push({ id: element.id, name: element.firstname + ' ' + element.lastname });
            this.userSelected.push(element.id);
          }
        }
        this.setEventParticipants = Object.assign(this.authService.uniqueObjData(this.setEventParticipants, 'id'));
        this.userSelected = this.authService.uniqueData(this.userSelected);
      });
    }
  }

  /**
   * Function is used to get event details by event Id
   * @author  MangoIt Solutions
   * @param   {eventid}
   * @return  {object} get all event details by event Id
   */
  getEventInfo(eventid: number) {
    this.authService.memberSendRequest('get', 'get-event-by-id/' + eventid, null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        this.eventDetails = respData['result'][0];
        let userId: string = localStorage.getItem('user-id');
        if (this.eventDetails.user.id == userId || this.userDetails.roles[0] == 'admin') {
          this.setEventData();
        } else {
          var redirectUrl: string = '/web/organizer/organizer-event';
          this._router.navigate([redirectUrl]);
        }
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  /**
   * Function is used to set event data on form feilds
   * @author  MangoIt Solutions
   */
  setEventData() {
    var start_time: string[];
    var end_time: string[];
    var date_to: string[];
    var date_from: string[];
    this.dateRepeat;
    let type: { item_id: number; item_text: string }[] = [];

    const formArray: any = this.eventForm.get('tags') as FormArray;

    if (this.eventDetails?.eventsTags) {
      this.eventDetails?.eventsTags.forEach((tag: any) => {
        if (!this.tagsName.includes(tag?.tag_name)) {
          this.tagsName.push(tag?.tag_name);
          formArray.push(new FormControl(tag?.tag_name));
        }
      });
    }

    if (this.eventDetails.type) {
      if (this.eventTypeDropdownList && this.eventTypeDropdownList.length > 0) {
        this.eventTypeDropdownList.forEach((val, key) => {
          if (val.item_id == this.eventDetails.type) {
            if (this.eventDetails.type == 1) {
              type.push({ item_id: 1, item_text: this.language.create_event.club_event });
            } else if (this.eventDetails.type == 2) {
              type.push({ item_id: 2, item_text: this.language.create_event.group_event });
            } else if (this.eventDetails.type == 3) {
              type.push({ item_id: 3, item_text: this.language.create_event.functionaries_event });
            } else if (this.eventDetails.type == 4) {
              type.push({ item_id: 4, item_text: this.language.create_event.courses });
            } else if (this.eventDetails.type == 5) {
              type.push({ item_id: 5, item_text: this.language.create_event.seminar });
            }
          }
        });
      }
    }

    if (this.eventDetails.date_from) {
      date_from = this.eventDetails.date_from.split('T');
      start_time = date_from[1].split('.');
    }

    if (this.eventDetails.date_to) {
      date_to = this.eventDetails.date_to.split('T');
      end_time = date_to[1].split('.');
    }

    if (this.eventDetails.image && this.eventDetails.image != null) {
      let tokenUrl = this.commonFunctionService.genrateImageToken(this.eventDetails?.id, 'event');
      this.eventDetails.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
      this.commonFunctionService.loadImage(this.eventDetails.token);
      this.hasPicture = true;
      this.imageUrl = tokenUrl;
      this.eventImage = tokenUrl;
    } else {
      this.hasPicture = false;
      this.eventImage = '';
    }

    if (this.eventDetails.document && this.eventDetails.document != '') {
      this.eventFile = this.eventDetails.document;
      this.fileUrl = this.eventDetails.document;
    }
    // if (this.eventDetails?.event_images[0]?.event_image != null) {
    // 	this.hasPicture = true;
    // 	if (this.eventDetails?.event_images[0]?.event_image) {
    // 		this.imageUrl = this.eventDetails?.event_images[0]?.event_image;

    // 		this.eventDetails.event_images[0].event_image = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(this.eventDetails?.event_images[0]?.event_image.substring(20)));
    // 		this.eventImage = this.eventDetails?.event_images[0]?.event_image;
    // 	}
    // } else {
    // 	this.hasPicture = false;
    // 	this.eventImage = '';
    // }

    // if (this.eventDetails?.event_images[0]?.event_document) {
    // 	this.eventFile = this.eventDetails?.event_images[0]?.event_document;
    // 	this.fileUrl = this.eventDetails?.event_images[0]?.event_document;
    // }

    if (this.eventDetails.recurrence != null && this.eventDetails.recurrence != '') {
      const textArray: string[] = this.eventDetails.recurrence.split(';', 1);
      const until = this.eventDetails.recurrence.split(';', 2)[1];
      const textUNTIL: string = until.split('=')[1].split('T', 1).toString();
      const untilDate: string[] = textUNTIL.split('T', 1);
      const endDate: string = untilDate[0].slice(4, 6) + '/' + untilDate[0].slice(6, 8) + '/' + untilDate[0].slice(0, 4);
      this.isRecurred = textArray[0].slice(5).concat('; UNTIL ' + endDate);
      if (this.eventDetails.date_repeat) {
        this.endDateRepeat = true;
        this.dateRepeat = this.eventDetails.date_repeat.split('T')[0];
      }
      var recc = this.eventDetails.recurrence.split(';', 2)[0];
      this.typerecc = recc.split('=')[1];

      if (this.eventDetails.recurrence.includes('INTERVAL')) {
        this.interval = this.eventDetails.recurrence.split(';')[2].split('=')[1];
      }
      if (this.eventDetails.recurrence.includes('BYDAY')) {
        this.byDay = this.eventDetails.recurrence.split(';')[3].split('=')[1];
      }
      this.checkRecc = false;
      if (this.typerecc && (this.interval || this.byDay)) {
        this.recurrenceSelected = 5;
        this.typereccurenc.push({ item_id: 5, item_text: this.language.new_create_event.custom });
        this.checkRecc = true;
      } else if (this.typerecc == 'DAILY') {
        this.recurrenceSelected = 1;
        this.typereccurenc.push({ item_id: 1, item_text: this.language.new_create_event.every_day });
        this.checkRecc = true;
      } else if (this.typerecc == 'WEEKLY') {
        this.recurrenceSelected = 2;
        this.typereccurenc.push({ item_id: 2, item_text: this.language.new_create_event.every_week });
        this.checkRecc = true;
      } else if (this.typerecc == 'MONTHLY') {
        this.recurrenceSelected = 3;
        this.typereccurenc.push({ item_id: 3, item_text: this.language.new_create_event.every_month });
        this.checkRecc = true;
      } else if (this.typerecc == 'YEARLY') {
        this.recurrenceSelected = 4;
        this.typereccurenc.push({ item_id: 4, item_text: this.language.new_create_event.every_year });
        this.checkRecc = true;
      } else {
        this.recurrenceSelected = 0;
        this.typereccurenc.push({ item_id: 0, item_text: this.language.new_create_event.does_not_repeat });
        this.checkRecc = true;
      }
    } else {
      if (JSON.parse(this.eventDetails.recurring_dates).length == 1) {
        this.typereccurenc.push({ item_id: 0, item_text: this.language.new_create_event.does_not_repeat });
        this.checkRecc = true;
      }
      this.recurrenceSelected = 0;
      this.eventForm.controls['recurrence'].setValue('');
      this.eventForm.get('recurrence').clearValidators();
      this.eventForm.get('recurrence').updateValueAndValidity();
    }

    if (this.eventDetails.room == null) {
      this.eventDetails.room = null;
    } else if (this.roomDropdownList?.length > 0) {
      this.roomDropdownList.forEach((value: any, key: number) => {
        if (value.id == this.eventDetails.room) {
          this.roomSelected = value.id;
          this.exitsRoom.push(value);
          this.roomsById(this.roomSelected);
        }
      });
      setTimeout(() => {
        if (this.romData?.length > 0) {
          this.romData.forEach(element => {
            if (element.id == this.eventDetails.room) {
              this.selectedRoom = element;
            }
          });
        }
      }, 2000);
    }

    var visibility: number[] = [];
    this.groupGet = [];
    var groupList: any = [];
    if (this.eventDetails.visibility) {
      this.visibility = this.eventDetails.visibility;
      if (this.visibilityDropdownList && this.visibilityDropdownList.length > 0) {
        this.visibilityDropdownList.forEach((value: any, key: number) => {
          if (value.item_id == this.eventDetails.visibility) {
            this.visib = value.item_id;
            visibility.push(value);
          }
        });
      }
      if (this.eventDetails.visibility == 3) {
        setTimeout(() => {
          groupList = [this.group_dropdown];
          if (groupList && groupList[0].length > 0) {
            groupList[0].forEach((value: any, key: number) => {
              if (value.id == this.eventDetails.group_id) {
                this.groupGet.push({ id: value.id, name: value.name });
                this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + value.id, null).subscribe((respData: any) => {
                  this.authService.setLoader(false);
                  var groupParticipants: any = respData.participants;
                  var groupUsers: any = [];
                  if (groupParticipants && groupParticipants.length > 0) {
                    groupParticipants.forEach((value, key) => {
                      var userGroupObj: any = { user_id: value.user_id, approved_status: value.approved_status };
                      groupUsers.push(userGroupObj);
                    });
                    this.groupUserList = groupUsers;
                  }
                });
              }
            });
          }
          if (this.groupGet.length > 0) {
            this.setEventParticipants = [];
          }
        }, 2000);
      }
    }
    if (this.eventDetails.chargeable) {
      this.eventPriceDisplay = true;
    }

    if (type.length && visibility.length) {
      this.eventForm.controls['name'].setValue(this.eventDetails.name);
      this.eventForm.controls['place'].setValue(this.eventDetails.place);
      this.eventForm.controls['type'].setValue(type);
      this.eventForm.controls['date_from'].setValue(date_from[0]);
      this.eventForm.controls['date_to'].setValue(date_to[0]);
      this.eventForm.controls['start_time'].setValue(start_time[0]);
      this.eventForm.controls['end_time'].setValue(end_time[0]);
      this.eventForm.controls['recurrence'].setValue(this.typereccurenc);
      this.eventForm.controls['date_repeat'].setValue(this.dateRepeat);
      if (this.eventDetails.show_guest_list == 'false') {
        this.eventForm.controls['show_guest_list'].setValue('');
      } else if (this.eventDetails.show_guest_list == 'true') {
        this.eventForm.controls['show_guest_list'].setValue(this.eventDetails.show_guest_list);
      }
      this.eventForm.controls['chargeable'].setValue(this.eventDetails.chargeable);
      this.eventForm.controls['price_per_participant'].setValue(this.eventDetails.price_per_participant);
      this.eventForm.controls['description'].setValue(this.eventDetails.description);

      this.eventForm.controls['author'].setValue(this.eventDetails.author);
      this.eventForm.controls['approved_status'].setValue(this.eventDetails.approved_status);
      this.eventForm.controls['participants'].setValue(this.eventDetails.participants);
      this.eventForm.controls['visibility'].setValue(visibility);
      this.eventForm.controls['room'].setValue(this.exitsRoom);
      if (this.eventDetails.allowed_persons != 'null') {
        this.eventForm.controls['allowed_persons'].setValue(this.eventDetails.allowed_persons);
      } else {
        this.eventForm.controls['allowed_persons'].setValue(null);
        this.eventForm.get('allowed_persons').clearValidators();
        this.eventForm.get('allowed_persons').updateValueAndValidity();
      }

      if (this.eventDetails.visibility == 3) {
        this.eventForm.controls['group'].setValue(this.groupGet);
      } else if (this.eventDetails.visibility == 1 || this.eventDetails.visibility == 2) {
        var uniqueUsers = this.setEventParticipants.filter((value, index, array) => array.indexOf(value) === index);
        this.eventForm.controls['participant'].setValue(uniqueUsers);
      }
    }

    if (this.eventDetails && this.eventDetails.recurring_dates && this.eventDetails.recurring_dates.length) {
      for (let i = 0; i < JSON.parse(this.eventDetails.recurring_dates).length; i++) {
        this.eventDate.removeAt(i);
        if (this.eventDate.value[i] && this.eventDate.value[i].date_from == null && this.eventDate.value[i].start_time == null && this.eventDate.value[i].end_time == null) {
          this.eventDate.removeAt(i);
          this.addAvailableTimes();
        }
      }
      this.eventDate.removeAt(0);
      if (JSON.parse(this.eventDetails.recurring_dates)) {
        JSON.parse(this.eventDetails.recurring_dates).forEach((key, value) => {
          if (key.start_time.includes(':00') && key.end_time.includes(':00')) {
            key.start_time = key.start_time.slice(0, 5);
            key.end_time = key.end_time.slice(0, 5);
          }
          const newAvailableTimes: UntypedFormGroup = this.formBuilder.group({
            date_from: [key.date_from, Validators.required],
            start_time: [key.start_time, Validators.required],
            end_time: [key.end_time, Validators.required],
          });
          this.eventDate.push(newAvailableTimes);
        });
      }
    }
    if (this.eventDetails && this.eventDetails.eventTask && Object.keys(this.eventDetails.eventTask).length != 0) {
      this.eventForm.controls['isTask'].setValue(true);
      this.isTaskField = true;
      var type_dropdown: any;
      this.taskStatus = this.eventDetails.eventTask.status;
      this.taskId = this.eventDetails.eventTask.id;
      if (this.eventDetails?.eventTask?.group_id == 0) {
        this.type_visibility = 0;
        type_dropdown = [{ id: 0, name: this.language.create_task.individual }];
        this.setUsers(this.eventDetails?.eventTask?.id, type_dropdown);
      } else {
        this.type_visibility = 1;
        type_dropdown = [{ id: 1, name: this.language.create_task.group }];
        if (this.group_dropdown && this.group_dropdown.length > 0) {
          this.group_dropdown.forEach((value, index) => {
            if (value.id == this.eventDetails?.eventTask?.group_id) {
              this.groups = [{ id: value.group_id, name: value.name }];
            }
          });
          this.task_user_selected = [];
          this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + this.eventDetails?.eventTask?.group_id, null).subscribe((respData: any) => {
            if (respData) {
              respData?.participants.forEach((value: any) => {
                this.task_user_selected.push({
                  user_id: value.user_id,
                  approved_status: value.read_status,
                });
              });
            }
          });
        }
        const newAvailableTimes: UntypedFormGroup = this.formBuilder.group({
          title: [this.eventDetails?.eventTask?.title, Validators.required],
          description: [this.eventDetails?.eventTask?.description, Validators.required],
          organizer_id: [this.eventDetails?.eventTask?.organizer_id],
          status: [this.eventDetails?.eventTask?.status],
          group_id: [this.eventDetails?.eventTask?.group_id],
          date: [this.eventDetails?.eventTask?.date.split('T')[0], Validators.required],
          type_dropdown: [type_dropdown, Validators.required],
          groups: [this.groups, Validators.required],
          user_select: [''],
          taskCollaborators: [''],
        });

        this.task.push(newAvailableTimes);
      }
    } else {
      $('#isTask_check').prop('checked', false);
    }
    this.taskEditorConfig = {
      editable: this.taskStatus == 1 ? false : true,
      spellcheck: true,
      minHeight: '5rem',
      maxHeight: '15rem',
      translate: 'no',
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
  }

  eventProcess() {
    // console.log(this.eventForm);

    //to check if recurrence selected is 0 (i.e. Does not repeat) or null (i.e. No recurrence selected)
    if (this.recurrenceSelected === 0 || this.recurrenceSelected === null) {
      let endDate = (<UntypedFormArray>this.eventForm.get('eventDate')).controls.slice(-1);

      this.eventForm.controls['date_to']?.setValue(this.formatDate(endDate[0]?.value?.date_from));
      this.eventForm.controls['date_repeat']?.setValue(this.formatDate(this.eventForm?.controls['date_to']?.value));
      this.eventForm.controls['recurrence'].setValue('');
      this.eventForm.get('recurrence').clearValidators();
      this.eventForm.get('recurrence').updateValueAndValidity();
    }

    //to check if visibility is 3 or 1/2, to set validations
    if (this.eventForm.value.visibility && this.eventForm.value.visibility[0].item_id === 3) {
      this.eventForm.get('group').setValidators(Validators.required);
      this.eventForm.get('group').updateValueAndValidity();
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
    } else if (this.eventForm.value.visibility && (this.eventForm.value.visibility[0].item_id === 1 || this.eventForm.value.visibility[0].item_id === 2)) {
      this.eventForm.get('participant').setValidators(Validators.required);
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group').clearValidators();
      this.eventForm.get('group').updateValueAndValidity();
    }

    //to validate task end date

    if (this.eventForm.value.task.length > 0) {
      if (this.eventForm.value.task[0].date) {
        this.taskDateValidate('', this.eventForm.value.task[0].date);
      }
    }

    this.eventSubmitted = true;
    //if (this.eventForm.valid && !this.errorDateTask.isError) {
    this.mustMatchs = this.eventForm.value.allowed_persons;
    this.endRepeatDate();
    this.endRepeat();
    if (this.isCustom == true && this.naturalNumber == true) {
      this.customReccDateError = { isError: true, errorMessage: this.language.create_event.select_custom_recc };
    } else {
      this.customReccDateError = { isError: false, errorMessage: '' };
    }

    if (this.selectedRoom != null && this.mustMatchs != null) {
      if (this.event_allDates.length > 0) {
        if (new Date(this.eventForm.value['date_from']) >= new Date(this.roomsByIdData.active_from) && new Date(this.eventForm.value['date_to']) <= new Date(this.roomsByIdData.active_to)) {
          var roomsData: any[] = [];
          var event_recuu: any = '';
          var event_startTime: any;
          var event_endTime: any;
          this.date = new Date(); // Today's date
          this.todays_date = this.datePipe.transform(this.date, 'yyyy-MM-dd');
          this.calendarRooms.forEach((elem: any) => {
            if (this.eventId == elem.id && elem.type != 'course') {
              this.allRoomCalndr[1]['avail'].forEach((el: any) => {
                if (elem.date_start == el.date_start) {
                  roomsData.push(el);
                }
              });
            } else {
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
            this.checkRoomAvailability(event_startTime, event_endTime, this.event_allDates, roomsData, this.eventForm.value.eventDate);
          } else if (this.eventForm.value.eventDate.length > 1) {
            /// if the multiple dates
            this.checkRoomAvailability(event_startTime, event_endTime, this.event_allDates, roomsData, this.eventForm.value.eventDate);
          } else {
            // no recurrence & no multiple dates
            event_startTime = this.eventForm.value['start_time'];
            event_endTime = this.eventForm.value['end_time'];
            this.checkRoomAvailability(event_startTime, event_endTime, this.event_allDates, roomsData, this.eventForm.value.eventDate);
          }
        } else {
          this.notificationService.showError(this.language.create_event.not_room, 'Error');
          this.matchDateError = { isError: true, errorMessage: this.language.create_event.not_room };
        }
      } else {
        this.eventDetails.roomBookingDates.forEach(v => {
          delete v.event_id;
        });
        this.eventForm.controls['roomBookingDates'].setValue(this.eventForm.controls['eventDate'].value);
      }
    }
    if (this.isTaskField == true) {
      if (this.eventForm?.controls['task']?.value?.length > 0 && this.task_user_selected?.length > 0) {
        if (this.task_user_selected.find((obj: any) => obj.user_id != this.eventForm.controls['task'].value[0].organizer_id)) {
          this.task_user_selected.push({
            user_id: this.eventForm.controls['task'].value[0].organizer_id,
            approved_status: 1,
          });
        }
        const unique2 = this.task_user_selected.filter((obj, index) => {
          return index === this.task_user_selected.findIndex(o => obj.user_id === o.user_id);
        });

        this.eventForm.controls['task'].value[0].taskCollaborators = unique2;
      }
      this.eventForm.controls['task'].value[0].date = this.formatDate(this.eventForm.controls['task'].value[0].date);
    } else if (this.isTaskField == false) {
      if (this.task.length > 0) {
        this.task_user_selected = [];
        this.task.removeAt(0);

        if (this.taskId > 0) {
          this.authService.setLoader(true);
          this.errorDateTask = { isError: false, errorMessage: '' };
          this.authService.memberSendRequest('delete', 'DeleteTask/' + this.taskId, null).subscribe((respData: any) => {
            this.authService.setLoader(false);

            if (respData['isError'] == false) {
            } else if (respData['code'] == 400) {
              this.notificationService.showError(respData['message'], 'Error');
            }
          });
        }
      }
    }

    if (this.eventForm.valid && !this.errorTime.isError && !this.errorDate.isError && !this.errorImage.isError && !this.errorDateTask.isError && !this.matchDateError.isError && !this.customReccDateError.isError) {
      this.eventSubmitted = false;
      this.eventForm.controls['type'].setValue(this.eventForm.value.type[0].item_id);
      var date_from: string = this.formatDate(this.eventForm.controls['date_from'].value);
      var start_time: string = this.eventForm.controls['start_time'].value;
      var date_to: string = this.formatDate(this.eventForm.controls['date_to'].value);
      var end_time: string = this.eventForm.controls['end_time'].value;
      this.eventForm.controls['date_from'].setValue(date_from + ' ' + start_time);
      this.eventForm.controls['date_to'].setValue(date_to + ' ' + end_time);
      this.eventForm.controls['date_repeat'].setValue(date_to + ' ' + end_time);
      this.eventForm.controls['visibility'].setValue(this.eventForm.value.visibility[0].item_id);
      var uniqueUsers = this.userSelected.filter((value, index, array) => array.indexOf(value) === index);
      this.eventForm.controls['users'].setValue(uniqueUsers);
      this.eventForm.controls['chargeable'].setValue(this.eventForm.value.chargeable);
      this.eventForm.controls['price_per_participant'].setValue(this.eventForm.value.price_per_participant);
      var formData: FormData = new FormData();

      for (const key in this.eventForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.eventForm.value, key)) {
          const element: any = this.eventForm.value[key];

          if (key == 'file' && (this.fileToReturn || this.imageUrl)) {
            if (this.fileToReturn) {
              formData.append('file', this.fileToReturn);
            } else {
              formData.append('event_image', this.imageUrl);
            }
          }

          if (key == 'file' && (this.picVid1 || this.fileUrl)) {
            if (this.picVid1) {
              formData.append('file', this.picVid1);
            } else {
              formData.append('event_document', this.fileUrl);
            }
          } else if (key == 'file' && (this.picVid1 == null || this.picVid1 == undefined) && (this.fileUrl == null || this.fileUrl == '' || this.fileUrl == undefined)) {
            formData.append('event_document', '');
          }

          if (key == 'room') {
            if (this.roomSelected) {
              formData.append('room', this.roomSelected);
            } else if (this.exitsRoom.length > 0) {
              formData.append('room', this.exitsRoom);
            } else {
              formData.append('room', 'null');
            }
          }

          if (key == 'recurrence') {
            if (this.finalCustomRecurrence != null || this.recurrenceString != null || this.eventDetails.recurrence == '' || this.eventDetails.recurrence == null || this.eventDetails.recurrence) {
              if (element[0] && element[0]['item_id'] == 5 && this.recurrenceSelected == 5) {
                formData.append('recurrence', this.finalCustomRecurrence);
              } else if (element[0] && element[0]['item_id'] == 0 && this.recurrenceSelected == 0) {
                formData.append('recurrence', this.recurrenceString);
              } else if (this.recurrenceString && this.recurrenceSelected !== 0 && this.recurrenceSelected !== null) {
                formData.append('recurrence', this.recurrenceString);
              } else if (this.finalCustomRecurrence && this.recurrenceSelected !== 0 && this.recurrenceSelected !== null) {
                formData.append('recurrence', this.finalCustomRecurrence);
              } else if (this.eventDetails.recurrence && this.recurrenceSelected !== 0 && this.recurrenceSelected !== null) {
                formData.append('recurrence', this.eventDetails.recurrence);
              }
            } else {
              formData.append('recurrence', this.recurrenceString);
            }
          }
          if (key == 'chargeable') {
            if (this.eventForm.value.chargeable) {
              formData.append('chargeable', this.eventForm.controls['price_per_participant'].value);
            }
          }

          if (key == 'participant' && element[0] != null) {
            if (element && element.length > 0) {
              element.forEach((value, key) => {
                formData.append('participant[' + key + ']', JSON.stringify(value.id));
              });
            }
          } else if (key == 'group' && element[0] != null) {
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
          }
          if (key == 'users') {
            // if (this.visibility == 2) {
            // 	let userObjec: { user_id: any; approved_status: number }[] = [];
            // 	userObjec.push({ user_id: this.eventDetails.author, approved_status: 1 });
            // 	formData.append('users', JSON.stringify(userObjec));
            // }
            if (this.visibility == 1 || this.visibility == 2 || this.visibility == 4) {
              var userArr: { user_id: string; approved_status: number }[] = [];

              if (element && element.length > 0) {
                element.forEach((value, key) => {
                  var status: number = 0;
                  if (value == this.eventDetails.author) {
                    status = 1;
                  }
                  var userObj = { user_id: value, approved_status: status };
                  userArr.push(userObj);
                });
              }
              let ifAuthor = 0;
              if (userArr) {
                userArr.forEach((val: any) => {
                  if (val.user_id == this.eventDetails.author) {
                    ifAuthor++;
                  }
                });
              }
              if (ifAuthor == 0) {
                userArr.push({ user_id: this.eventDetails.author, approved_status: 1 });
              }
              let uniqueUsers = this.authService.uniqueData(userArr);
              formData.append('users', JSON.stringify(uniqueUsers));
            }
            if (this.visibility == 3 && this.groupUserList != null) {
              if (this.groupUserList && this.groupUserList.length > 0) {
                this.groupUserList.forEach((val: any) => {
                  let status: number = 0;
                  if (val.user_id == this.eventDetails.author) {
                    status = 1;
                  }
                  this.newGroupList.push({ user_id: val['user_id'], approved_status: status });
                });
              }
              let ifAuthor = 0;
              if (this.newGroupList && this.newGroupList.length > 0) {
                this.newGroupList.forEach((val: any) => {
                  if (val.user_id == this.eventDetails.author) {
                    if (val.approved_status == 1) {
                      ifAuthor++;
                    }
                  }
                });
              }
              if (ifAuthor == 0) {
                let author_id: number = this.eventDetails.author;
                this.newGroupList.push({ user_id: author_id, approved_status: 1 });
              }
              formData.append('users', JSON.stringify(this.newGroupList));
            }
          }
          if (key == 'eventDate') {
            element.forEach((ele: any, idn: any) => {
              ele.date_from = this.formatDate(ele.date_from);
            });
            formData.append('eventDate', JSON.stringify(element));
          }
          if (key == 'roomBookingDates') {
            formData.append('roomBookingDates', JSON.stringify(element));
          }

          if (key == 'task') {
            formData.append('task', JSON.stringify(element));
          }
          if (key == 'tags') {
            formData.append('event_tags', JSON.stringify(element));
          } else {
            if (
              key != 'file' &&
              key != 'users' &&
              key != 'participant' &&
              key != 'chargeable' &&
              key != 'recurrence' &&
              key != 'roomBookingDates' &&
              key != 'room' &&
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

      console.log(formData);

      this.authService.setLoader(true);
      this.authService.memberSendRequest('put', 'event/' + this.eventId, formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.eventSubmitted = false;
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'Event', (error: any) => {});

          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          setTimeout(() => {
            this._router.navigate(['/web/event-detail/' + respData['result']['event']['id']]);
          }, 3500);
        } else if (respData['code'] == 400) {
          // this.notificationService.showError(respData['message'], null);
          this.notificationService.showError(respData['message'], 'Error');

          this.setVisibilityOnError(this.visibility);
          this.setTypeOnError(this.eventForm.controls['type'].value);
          this.eventForm.controls['date_to'].setValue(date_to);
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

  setTypeOnError(id: number) {
    let visibility_data = [];
    if (id == 1) {
      visibility_data.push({ item_id: 1, item_text: this.language.create_event.club_event });
    } else if (id == 2) {
      visibility_data.push({ item_id: 2, item_text: this.language.create_event.group_event });
    } else if (id == 3) {
      visibility_data.push({ item_id: 3, item_text: this.language.create_event.functionaries_event });
    } else if (id == 4) {
      visibility_data.push({ item_id: 4, item_text: this.language.create_event.courses });
    } else if (id == 5) {
      visibility_data.push({ item_id: 4, item_text: this.language.create_event.seminar });
    }
    this.eventForm.controls['type'].setValue(visibility_data);
  }

  /**
   * Function is used check the availability of Room for the Event dates
   * @author  MangoIt Solutions
   * @param   {startTime,endTime,course all dates,rooms dates}
   * @return  {Array Of Object} if conditions is correct then room booking dates else error
   */
  checkRoomAvailability(event_startTime: any, event_endTime: any, event_allDates: any, roomsData: any, eventForm_eventDate: any) {
    var count: number = 0;
    var finalEventData: any[] = [];
    var eventRecu: any[] = [];
    var event_dates_length: any;
    if (eventForm_eventDate?.length > 1) {
      event_dates_length = eventForm_eventDate.length;
      eventForm_eventDate.forEach((elem: any, index: any) => {
        elem.start_time = this.commonFunctionService.formatTime(elem.start_time);
        elem.end_time = this.commonFunctionService.formatTime(elem.end_time);
        roomsData.forEach((element: any, idn: any) => {
          if (element.date_start == this.datePipe.transform(elem.date_from, 'yyyy-MM-dd') && elem.start_time >= element.start.split('T')[1] && elem.end_time <= element.end.split('T')[1] && element.classNames != 'room-booked') {
            finalEventData.push(elem);
            count++;
          }
        });
      });
    } else if (event_allDates) {
      event_dates_length = event_allDates.length;
      event_allDates.forEach((elem: any, index: any) => {
        roomsData.forEach((element: any, idn: any) => {
          event_startTime = this.commonFunctionService.formatTime(event_startTime);
          event_endTime = this.commonFunctionService.formatTime(event_endTime);
          if (element.date_start == this.datePipe.transform(elem, 'yyyy-MM-dd') && event_startTime >= element.start.split('T')[1] && event_endTime <= element.end.split('T')[1] && element.classNames != 'room-booked') {
            finalEventData.push(elem);
            count++;
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
   * Function is used to select Recurrence
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
    this.eventForm.controls['date_to'].setValue('');
  }

  /**
   * Function is used to select custome Recurrence
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

  endRepeatDate() {
    if (this.eventForm.controls.date_to != null) {
      this.endDateRepeat = true;
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      this.onRec();
    }
  }

  /**
   * Function is used to set date in form
   * @author  MangoIt Solutions
   */
  endRepeat() {
    this.eventForm.controls['date_from'].setValue('');
    this.eventForm.controls['start_time'].setValue('');
    this.eventForm.controls['date_from'].setValue('');
    this.eventForm.controls['date_from'].setValue(this.formatDate(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].date_from));
    this.eventForm.controls['start_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].start_time);
    this.eventForm.controls['end_time'].setValue(this.eventForm.controls['eventDate'].value.sort((a: any, b: any) => new Date(a.date_from).valueOf() - new Date(b.date_from).valueOf())[0].end_time);
    if (this.eventForm.controls.recurrence.value != '' && this.eventForm.controls.recurrence.value[0].item_id != 0) {
      if (this.dateRepeat) {
        this.endDateRepeat = true;
        this.onRec();
      } else {
        this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
        this.endDateRepeat = true;
        this.onRecurrence();
      }
    } else {
      this.eventForm.controls['date_repeat'].setValue('');
      this.endDateRepeat = false;
      this.getEventsAllDates();
    }
  }

  /**
   * Function is used to select Recurrence
   * @author  MangoIt Solutions
   */
  onRec() {
    if (this.customRecurrenceTypeSelected || this.recurrenceSelected == 5 || this.recurrenceSelected) {
      if (this.customRecurrenceTypeSelected) {
        this.setCustomRecurrence();
      } else if (this.recurrenceSelected == 5) {
        this.setCustomRecurrence();
      } else {
        this.onRecurrence();
      }
    } else {
      if (this.typerecc && (this.interval || this.byDay)) {
        this.setCustomRecurrence();
      } else {
        this.onRecurrence();
      }
    }
  }

  /**
   * Function to create the Recurrence
   * @author  MangoIt Solutions
   */
  onRecurrence() {
    if (this.recurrenceSelected != 5) {
      this.recurrenceString = '';
      let monthDates: any = [];
      if (this.eventForm?.controls?.['eventDate']?.value?.length > 0) {
        this.eventForm.controls['eventDate'].value.sort().forEach(element => {
          monthDates.push(new Date(element.date_from).getDate());
        });
      }
      if (this.eventForm.controls['eventDate'].value.length <= 1) {
        if (this.eventForm?.controls?.recurrence?.value != '') {
          if (this.eventForm.controls.recurrence.value[0].item_id != 5 && this.eventForm.controls.date_repeat.value != '') {
            if (this.eventForm.controls.recurrence.value[0].item_id == 0) {
              this.recurrenceString = '';
            } else if (this.eventForm.controls.recurrence.value[0].item_id == 1) {
              let rule = new RRule({
                freq: RRule.DAILY,
                dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
                until: new Date(
                  Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)
                ),
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
                until: new Date(
                  Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)
                ),
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
                until: new Date(
                  Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)
                ),
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
                until: new Date(
                  Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)
                ),
                // 'bymonthday': monthDates
              });
              let recc: string = rule.toString();
              let re: string = recc.slice(0, 25).replace(':', '=');
              let reccu: string = recc.slice(25);
              this.recurrenceString = reccu + ';' + re;
              this.event_allDates = RRule.fromString(this.recurrenceString).all();
            }
          }
        } else if (this.typerecc == 'DAILY') {
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
        } else if (this.typerecc == 'WEEKLY') {
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
        } else if (this.typerecc == 'MONTHLY') {
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
        } else if (this.typerecc == 'YEARLY') {
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
      }
    } else {
      this.setCustomRecurrence();
    }
  }

  setCustomRecurrence() {
    if (this.recurrenceSelected == 5) {
      if (this.formatDate(this.eventForm.controls['date_to'].value)) {
        this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      } else {
        this.eventForm.controls['date_to'].setValue(this.formatDate(this.eventForm.controls['date_from'].value));
        this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      }
      let monthDates: any = [];
      if (this.eventForm.controls['eventDate'].value) {
        this.eventForm.controls['eventDate'].value.sort().forEach(element => {
          monthDates.push(new Date(element.date_from).getDate());
        });
      }
      if (this.eventForm.controls['eventDate'].value.length <= 1) {
        let recurrenceData: string = '';
        if (this.customRecurrenceTypeSelected != null) {
          if (this.customRecurrenceTypeSelected == 1) {
            recurrenceData = '';
            let numberWeek: number = $('.custom_recurrence_daily').val();
            let r_rule = {
              freq: RRule.DAILY,
              dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
              until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
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
          } else if (this.customRecurrenceTypeSelected == 2) {
            recurrenceData = '';
            let numberWeek: number = $('.custom_recurrence_weekly').val();
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
                recc = recc_str;
              }
            }
            let re: string = recc.slice(0, 25).replace(':', '=');
            let reccu: string = recc.slice(25);
            recurrenceData = reccu + ';' + re;
            this.event_allDates = RRule.fromString(recurrenceData).all();
          } else if (this.customRecurrenceTypeSelected == 3) {
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
        } else if (this.typerecc == 'DAILY') {
          //daily
          recurrenceData = '';
          let r_rule = {
            freq: RRule.DAILY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
          };
          if (this.interval) {
            r_rule['interval'] = this.interval;
          }
          let rule = new RRule(r_rule);
          let recc: string = rule.toString();
          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          recurrenceData = reccu + ';' + re;
          this.event_allDates = RRule.fromString(recurrenceData).all();
        } else if (this.typerecc == 'WEEKLY') {
          recurrenceData = '';
          let numberWeek: string = this.interval;
          let r_rule = {
            freq: RRule.WEEKLY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
          };
          if (numberWeek) {
            r_rule['interval'] = numberWeek;
          }
          let rule = new RRule(r_rule);
          var recc: string = rule.toString();

          if (this.byDay) {
            let byday = this.byDay.split(',');
            if (byday.length > 0) {
              let recc_str: string;
              recc_str = rule.toString().concat(';BYDAY=');
              if (byday && byday.length > 0) {
                byday.forEach((val, key) => {
                  recc_str = recc_str.concat(val + ',');
                  if (key == byday.length - 1) {
                    recc_str = recc_str.concat(val);
                  }
                });
                recc = recc_str;
              }
            }
          }

          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          recurrenceData = reccu + ';' + re;
          this.event_allDates = RRule.fromString(recurrenceData).all();
        } else if (this.typerecc == 'MONTHLY') {
          recurrenceData = '';
          let numberWeek: string = this.interval;
          let r_rule: { freq: Frequency; dtstart: Date; until: Date; bymonthday: any } = {
            freq: RRule.MONTHLY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
            bymonthday: monthDates,
          };
          if (numberWeek) {
            r_rule['interval'] = numberWeek;
          }
          let rule: RRule = new RRule(r_rule);
          let recc: string = rule.toString();
          let re: string = recc.slice(0, 25).replace(':', '=');
          let reccu: string = recc.slice(25);
          recurrenceData = reccu + ';' + re;
          this.event_allDates = RRule.fromString(recurrenceData).all();
        } else if (this.typerecc == 'YEARLY') {
          recurrenceData = '';
          let numberWeek: string = this.interval;
          let r_rule = {
            freq: RRule.YEARLY,
            dtstart: new Date(Date.UTC(new Date(this.eventForm.controls.date_from.value).getFullYear(), new Date(this.eventForm.controls.date_from.value).getMonth(), new Date(this.eventForm.controls.date_from.value).getDate(), 0o0, 0o0, 0o0)),
            until: new Date(Date.UTC(new Date(this.eventForm.controls.date_repeat.value).getFullYear(), new Date(this.eventForm.controls.date_repeat.value).getMonth(), new Date(this.eventForm.controls.date_repeat.value).getDate(), 0o0, 0o0, 0o0)),
            bymonthday: monthDates,
          };
          if (numberWeek) {
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
  }

  customReccModalClose() {
    $('#showPopup').trigger('click');
    this.closeModal();
  }

  getEventsAllDates() {
    var alldates: any[] = [];
    this.event_allDates = [];
    if (this.recurrenceSelected == 0) {
      this.eventForm.controls['date_to'].setValue(this.eventForm.value['date_from']);
    }
    if (this.eventForm.controls.eventDate.value.length > 1) {
      var cour_dates: any[] = [];
      alldates = this.eventForm.controls.eventDate.value;
      alldates.forEach(element => {
        cour_dates.push(new Date(element.date_from));
      });
      this.event_allDates = this.authService.uniqueData(cour_dates);
    } else {
      this.eventForm.controls['date_repeat'].setValue(this.formatDate(this.eventForm.controls['date_to'].value));
      alldates = this.commonFunctionService.getDates(new Date(this.eventForm.controls.date_from.value), new Date(this.eventForm.controls.date_to.value));
      this.event_allDates = alldates;
    }
  }

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
   * Function to checked the box if price is there
   * @param event
   */
  eventCheck(event: Event) {
    if (event.target['checked']) {
      this.eventPriceDisplay = true;
    } else {
      this.eventPriceDisplay = false;
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
    this.eventForm.controls['allowed_persons'].setValue('');
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
    this.exitsRoom = [];
    this.roomSelected = null;
    if (this.romData.length > 0) {
      this.romData.forEach(element => {
        if (element.id == item.id) {
          this.selectedRoom = null;
        }
      });
    }
    this.eventForm.controls['allowed_persons'].setValue('');
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

  onTypeSelect(item: { item_id: number; item_text: string }) {
    this.type = item.item_id;
  }

  /**
   * Function is used to add validation as per visibility selection
   * @author  MangoIt Solutions
   */
  onVisibilitySelect(item: { item_id: number; item_text: string }) {
    this.visibility = item.item_id;

    if (this.visibility == 3) {
      this.eventForm.get('group').setValidators(Validators.required);
      this.eventForm.get('group').updateValueAndValidity();
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
      this.userSelected = [];
    } else if (this.visibility == 1) {
      this.eventForm.get('participant').setValidators(Validators.required);
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group').clearValidators();
      this.eventForm.get('group').updateValueAndValidity();
      this.userSelected = [];
    } else if (this.visibility == 2) {
      this.userSelected = [];
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group').clearValidators();
      this.eventForm.get('group').updateValueAndValidity();
    } else if (this.visibility == 4) {
      this.userSelected = [];
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group').clearValidators();
      this.eventForm.get('group').updateValueAndValidity();
      if (this.alluserDetails && this.alluserDetails.length > 0) {
        this.alluserDetails.forEach(element => {
          this.userSelected.push(element.id);
        });
      }
    }
  }

  /**
   * Function is used to remove validation as per visibility selection
   * @author  MangoIt Solutions
   */
  changeVisibility() {
    if (this.eventForm.controls.visibility.status == 'INVALID') {
      this.eventForm.controls['group'].setValue('');
      this.eventForm.controls['participant'].setValue('');
      this.visibility = null;
      this.eventForm.get('participant').clearValidators();
      this.eventForm.get('participant').updateValueAndValidity();
      this.eventForm.get('group').clearValidators();
      this.eventForm.get('group').updateValueAndValidity();
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

  onUserSelectAll(item: { id: number; name: string }) {
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

  /**
   * Function is used to get approved Group Users
   * @author  MangoIt Solutions
   * @param   {group_id, name}
   * @return  {object} group user object
   */

  onGroupSelect(item: { id: number; name: string }) {
    this.userSelected = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + item.id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      var groupParticipants: any = respData.participants;
      var groupUsers: any = [];
      this.groupUserList = [];
      groupParticipants.forEach((value, key) => {
        if (value.approved_status == 1) {
          var userGroupObj: { user_id: string; approved_status: number } = { user_id: value.user_id, approved_status: value.approved_status };
          groupUsers.push(userGroupObj);
        }
      });
      this.groupUserList = groupUsers;
    });
  }

  closeModal() {}

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  dateSubmit() {
    if (this.eventForm.controls['eventDate'].value[0] && this.eventForm.controls['eventDate'].value[0]?.date_from != '') {
      if (this.eventForm.controls['eventDate'].value.length == 1) {
        this.recurrenceDropdownField = true;
        this.checkRecc = true;
      }
    } else {
      this.recurrenceDropdownField = false;
    }
  }

  errorDate: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  errorTime: { isError: boolean; errorMessage: string; index: '' } = { isError: false, errorMessage: '', index: '' };
  /**
   * Function is used to compare two date
   * @author  MangoIt Solutions
   */
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

  /**
   * Function is used to compair two time
   * @author  MangoIt Solutions
   */
  compareTwoTimes(i: any) {
    if (this.eventForm.controls['eventDate'].value[i] && this.eventForm.controls['eventDate'].value[i]?.start_time != '' && this.eventForm.controls['eventDate'].value[i] && this.eventForm.controls['eventDate'].value[i]?.end_time != '') {
      if (this.eventForm.controls['eventDate'].value[i]?.start_time >= this.eventForm.controls['eventDate'].value[i]?.end_time) {
        this.errorTime = { isError: true, errorMessage: this.language.error_message.end_time_same, index: i };
      } else {
        this.errorTime = { isError: false, errorMessage: '', index: '' };
      }
    }
  }

  /**
   * Function is used to select week day
   * @author  MangoIt Solutions
   */
  onWeekDaySelect(item: { item_id: number; description: string }[]) {
    this.weekDayTypeSelected.push(item['item_id']);
  }

  /**
   * Function is used to de select week day
   * @author  MangoIt Solutions
   */
  onWeekDayDeSelect(item: { item_id: number; description: string }[]) {
    this.weekDayTypeSelected.forEach((value, index) => {
      if (value == item['item_id']) {
        this.weekDayTypeSelected.splice(index, 1);
      }
    });
  }

  /**
   * Function is used to download document
   * @author  MangoIt Solutions
   * @param   {path}
   */
  download(path: any, type: any) {
    let data = {
      name: path,
      event_id: this.eventId,
      type: type,
    };
    this.dowloading = true;
    var endPoint = 'download-document';
    if (data && data.name) {
      let filename = data.name.split('/').reverse()[0];
      this.authService
        .downloadDocument('post', endPoint, data)
        .toPromise()
        .then((blob: any) => {
          saveAs(blob, filename);
          this.authService.setLoader(false);
          this.dowloading = false;
          setTimeout(() => {
            this.authService.sendRequest('post', 'delete-document/uploads', data).subscribe((result: any) => {
              this.result = result;
              this.authService.setLoader(false);
              if (this.result.success == false) {
                this.notificationService.showError(this.result['result']['message'], 'Error');
              } else if (this.result.success == true) {
                this.documentData = this.result['result']['message'];
              }
            });
          }, 7000);
        })
        .catch(err => {
          this.responseMessage = err;
        });
    }
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
        this.eventForm.patchValue({ file: this.fileToReturn });

        this.eventForm.get('file').updateValueAndValidity();
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

  errorFile: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  errorFiles: { Error: boolean; errorMessage: string } = { Error: false, errorMessage: '' };
  uploadFile1(event: Event) {
    this.picVid1 = null;
    $('.preview_txt1').hide();
    $('.preview_txt1').text('');
    this.errorFile = { isError: false, errorMessage: '' };
    const file: File = (event.target as HTMLInputElement).files[0];
    const mimeType: string = file.type;
    const mimeType1: number = file.size;

    if (file) {
      this.eventFile = '';
    }

    if (mimeType1 <= 20000000) {
      if (mimeType.match(/application\/*/) == null && mimeType.match(/text\/*/) == null) {
        this.errorFiles = { Error: true, errorMessage: this.language.error_message.common_valid };

        // this.eventForm.controls['add_docfile'] = null;
        setTimeout(() => {
          this.errorFiles = { Error: false, errorMessage: '' };
        }, 4000);
        this.picVid1 = null;
        $('.preview_txt1').hide();
        $('.preview_txt1').text('');
      } else {
        this.errorFile = { isError: false, errorMessage: '' };
        this.picVid1 = file;
        const reader: FileReader = new FileReader();
        reader.readAsDataURL(file);
        var urll: any;
        reader.onload = _event => {
          urll = reader.result;
        };
        $('.message-upload-list').show();
      }
      $('.preview_txt1').show();
      $('.preview_txt1').text(file.name);
    } else {
      this.errorFile = { isError: true, errorMessage: this.language.create_message.file_size };

      setTimeout(() => {
        this.errorFile = { isError: false, errorMessage: '' };
      }, 3000);
      // this.eventForm.controls['add_docfile'] = null;
    }
  }

  onCancel() {
    //window.history.back();
    this._router.navigate(['/web/organizer/organizer-event']);
  }

  /**
   * Function to Add task in the course
   * @author  MangoIt Solutions
   */
  onTaskSelect() {
    this.isTaskField = !this.isTaskField;
    let control = this.eventForm.controls.task['controls'][0] as UntypedFormGroup;
    if (this.isTaskField && this.task && this.task.length < 1) {
      const newAvailableTimes: UntypedFormGroup = this.formBuilder.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        organizer_id: [localStorage.getItem('user-id')],
        status: [0],
        group_id: [''],
        groups: [''],
        user_select: [''],
        date: ['', Validators.required],
        type_dropdown: ['', Validators.required],
        taskCollaborators: [''],
      });
      this.task.push(newAvailableTimes);
    } else {
      // this.task_user_selected = [];
      // this.task.removeAt(0);
    }
  }

  /**
   * Function is used to select task type
   * @author  MangoIt Solutions
   */
  onTaskTypeSelect(item: { id: number; name: string }) {
    this.type_visibility = item.id;
    this.showUsers = false;
    this.participantSelectedToShow = [];
    this.task_user_selected = [];
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

  /**
   * Function is used to de select task type
   * @author  MangoIt Solutions
   */
  onTaskTypeDeSelect(item: { id: number; name: string }, index) {
    this.type_visibility = null;
    this.showUsers = false;
    this.participantSelectedToShow = [];
  }

  /**
   * Function is used to select task user
   * @author  MangoIt Solutions
   */
  onTaskUserSelect(item: { id: number; user_name: string }) {
    this.showUsers = true;
    this.participantSelectedToShow.push(item);
    this.participantSelectedItem.push(item.id);
    this.task_user_selected.push({
      user_id: item.id,
      approved_status: 1,
    });
  }

  /**
   * Function is used to remove task user
   * @author  MangoIt Solutions
   */

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

  /**
   * Function is used to select task group
   * @author  MangoIt Solutions
   */
  onTaskGroupSelect(item: { id: number; user_name: string }) {
    // this.eventForm.controls['task'].value[0].group_id = item.id;
    (this.eventForm.get('task') as FormArray).at(0).get('group_id').setValue(item.id);
    this.task_user_selected = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + item.id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData?.participants) {
        var groupParticipants = respData?.participants;
        if (groupParticipants && groupParticipants.length > 0) {
          groupParticipants.forEach((value, key) => {
            if (value.approved_status == 1) {
              this.task_user_selected.push({
                user_id: value.user_id,
                approved_status: 1,
              });
            }
          });
        }
      }
    });
  }

  /**
   * Function is used to set users participants
   * @author  MangoIt Solutions (R)
   * @param   {TaskId}
   * @return  {Array Of Object} users all detail
   */
  setUsers(taskid: number, type_dropdown: any) {
    if (sessionStorage.getItem('token')) {
      this.authService.memberSendRequest('get', 'getTaskCollaborator/task/' + taskid, null).subscribe((respData: any) => {
        for (const key in respData) {
          if (Object.prototype.hasOwnProperty.call(respData, key)) {
            var element: any = respData[key];
            this.setTaskUsers.push({
              id: element.user_id,
              user_email: element.user[0].email,
              user_name: element.user[0].firstname + ' ' + element.user[0].lastname,
            });

            this.task_user_selected.push({
              user_id: element.user_id,
              approved_status: 1,
            });
          }
        }
        const newAvailableTimes: UntypedFormGroup = this.formBuilder.group({
          title: [this.eventDetails?.eventTask?.title, Validators.required],
          description: [this.eventDetails?.eventTask?.description, Validators.required],
          organizer_id: [this.eventDetails?.eventTask?.organizer_id],
          status: [this.eventDetails?.eventTask?.status],
          group_id: [this.eventDetails?.eventTask?.group_id],
          groups: [''],
          date: [this.eventDetails?.eventTask?.date.split('T')[0], Validators.required],
          type_dropdown: [type_dropdown, Validators.required],
          user_select: [this.setTaskUsers, Validators.required],
          taskCollaborators: [''],
        });

        this.task.push(newAvailableTimes);
      });
    }
  }

  /**
   * Function is used to delete task by id
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  success message
   */
  deleteTask(taskId: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_task,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'DeleteTask/' + taskId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.responseMessage = respData.result.message;
          this.notificationService.showSuccess(this.responseMessage, 'Error');

          setTimeout(() => {
            this.taskStatus = 0;
            this.isTaskField = false;
            $('#isTask_check').prop('checked', false);
            this.task_user_selected = [];
            this.task.removeAt(0);
            this.getEventInfo(this.eventId);
          }, 2000);
        });
      },
      () => {}
    );
  }

  /**
   * Function is used to add task date validation
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  success message
   */

  taskDateValidate(date: any, dateNew?: any) {
    var date_from: any;
    var date_to: any;
    var taskDate: any;
    if (date) {
      taskDate = date.target.value;
    } else if (dateNew) {
      taskDate = dateNew;
    }

    if (this.eventForm?.value?.eventDate?.length == 1 && this.eventForm.controls?.date_to?.value != '') {
      if (this.formatDate(this.eventForm.controls.date_from.value) <= this.formatDate(taskDate) && this.formatDate(this.eventForm.controls.date_to.value) >= this.formatDate(taskDate)) {
        this.errorDateTask = { isError: false, errorMessage: '' };
      } else {
        this.errorDateTask = { isError: true, errorMessage: this.language.error_message.eventTaskDate };
      }
    } else {
      this.eventForm?.value?.eventDate?.forEach((element: any, index: any) => {
        if (index == 0) {
          date_from = this.formatDate(element.date_from);
        }
        if (this.eventForm?.value?.eventDate.length - 1 === index) {
          date_to = this.formatDate(element.date_from);
        }
        if (this.formatDate(date_from) <= this.formatDate(taskDate) && this.formatDate(date_to) >= this.formatDate(taskDate)) {
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
