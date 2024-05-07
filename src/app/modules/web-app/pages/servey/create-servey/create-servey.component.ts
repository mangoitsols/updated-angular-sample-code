import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { Observable, Subscription } from 'rxjs';
import { LoginDetails, ThemeType } from '@core/models';
import { io, Socket } from 'socket.io-client';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@env/environment';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DatePipe } from '@angular/common';

declare var $: any;
@Component({
  selector: 'app-create-servey',
  templateUrl: './create-servey.component.html',
  styleUrls: ['./create-servey.component.css'],
  providers: [DatePipe],
})
export class CreateServeyComponent implements OnInit, OnDestroy {
  language: any;
  recurrenceDropdownField: boolean = false;
  createServeyForm: UntypedFormGroup;
  userRole: string;
  responseMessage: string;
  formSubmit: boolean = false;
  TypeDropdownSettings: IDropdownSettings;
  groupTypeDropdownSettings: IDropdownSettings;
  optionsDropdownSettings: IDropdownSettings;
  surveyViewDropdownSettings: IDropdownSettings;
  notificationDropdownSettings: IDropdownSettings;
  optionsDropdownList: { item_id: number; item_text: string }[] = [];
  surveyViewDropdownList: { item_id: number; item_text: string }[] = [];
  TypeDropdownList: { item_id: string; item_text: string }[] = [];
  groupTypeDropdownList: { id: number; name: string }[] = [];
  selectedGroup: number[] = [];
  choiceData: { item_id: number; item_text: string }[] = [];
  userId: string;
  teamId: number;
  setTheme: ThemeType;
  surveyType: string;
  socket: Socket;
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
  private activatedSub: Subscription;
  imgErrorMsg: boolean = false;
  docErrorMsg: boolean = false;
  file: File;
  fileToReturn: File;
  croppedImage: string = '';
  imageChangedEvent: Event = null;
  image: File;
  imgName: string;
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  minDate: any;
  selectedSurveyOption: any;
  surveyViewSelected: any;
  notificationOption: number;
  breadCrumbItems: Array<BreadcrumbItem>;
  imageFile: File;

  tagsName: any[] = [];
  tagCtrl = new FormControl('');
  filteredTags: Observable<any[]>;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  allTags: any[] = [];
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: any;
  removable = true;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private lang: LanguageService,
    private themes: ThemeService,
    private notificationService: NotificationService,
    public navigation: NavigationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.authService.setLoader(false);
    let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
    this.socket = io(environment.serverUrl);
    this.userId = localStorage.getItem('user-id');
    this.teamId = userData.team_id;
    this.userRole = userData.roles[0];
    this.language = this.lang.getLanguageFile();
    this.getGroups();
    this.initBreadcrumb();
    this.choiceData = [
      { item_id: 1, item_text: this.language.Survey.web_notification },
      { item_id: 2, item_text: this.language.Survey.email_notification },
    ];

    this.createServeyForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', Validators.required],
      surveyOption: ['', Validators.required],
      surveyType: ['', Validators.required],
      groupType: ['', Validators.required],
      surveyEndDate: ['', Validators.required],
      surveyStartDate: ['', Validators.required],
      surveyViewOption: [''],
      additional_anonymous_voting: [''],
      additional_cast_vote: [''],
      surveyNotificationOption: [''],
      survey_Answers: this.formBuilder.array([this.formBuilder.control('', Validators.required)]),
      image: [''],
      tags: this.formBuilder.array([]),
    });

    this.getAllTags();
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice()))
    );

    (this.TypeDropdownList = [
      { item_id: 'Group', item_text: this.language.header.group },
      { item_id: 'All Club', item_text: this.language.Survey.all_club },
    ]),
      (this.TypeDropdownSettings = {
        singleSelection: true,
        idField: 'item_id',
        textField: 'item_text',
        enableCheckAll: false,
        closeDropDownOnSelection: true,
      });
    this.addAnswerOptions();

    this.optionsDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.surveyViewDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.notificationDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.optionsDropdownList = [
      { item_id: 0, item_text: this.language.Survey.single_selection },
      { item_id: 1, item_text: this.language.Survey.multiple_selection },
    ];

    this.surveyViewDropdownList = [
      { item_id: 0, item_text: this.language.Survey.always },
      { item_id: 1, item_text: this.language.Survey.after_voting },
      { item_id: 2, item_text: this.language.Survey.never },
    ];
  }

  get survey_Answers() {
    return this.createServeyForm.get('survey_Answers') as UntypedFormArray;
  }

  addAnswerOptions() {
    this.survey_Answers.push(this.formBuilder.control('', Validators.required));
  }

  removeAnswerOptions(index: number) {
    this.survey_Answers.removeAt(index);
  }

  //for survey selection options
  onOptionSelect(item: { item_id: number; item_text: string }) {
    this.selectedSurveyOption = item.item_id;
  }

  //for view survey results options
  surveyViewSelect(item: { item_id: number; item_text: string }) {
    this.surveyViewSelected = item.item_id;
  }

  //for notification options
  notificationSelect(item: { item_id: number; item_text: string }) {
    this.notificationOption = item.item_id;
  }

  serveyProcess() {
    this.formSubmit = true;
    var anonymous: string = this.createServeyForm.get('additional_anonymous_voting').value;
    if (anonymous) {
      this.createServeyForm.value['additional_anonymous_voting'] = anonymous.toString();
    } else {
      this.createServeyForm.value['additional_anonymous_voting'] = 'false';
    }
    var cast_vote: string = this.createServeyForm.get('additional_cast_vote').value;
    if (cast_vote) {
      this.createServeyForm.value['additional_cast_vote'] = cast_vote.toString();
    } else {
      this.createServeyForm.value['additional_cast_vote'] = 'false';
    }
    if (this.surveyType == 'All Club') {
      this.createServeyForm.controls['surveyType'].setValue('all_club');
    } else {
      this.createServeyForm.controls['surveyType'].setValue(this.surveyType);
    }
    if (this.selectedGroup) {
      this.createServeyForm.value['groupType'] = this.selectedGroup;
      this.createServeyForm.controls['groupType'].setValue(this.selectedGroup);
    }
    if (this.selectedSurveyOption !== null && this.selectedSurveyOption !== undefined) {
      const selectedOption = this.optionsDropdownList.find(option => option.item_id.toString() == this.selectedSurveyOption);
      if (selectedOption) {
        this.createServeyForm.controls['surveyOption'].setValue(selectedOption.item_id);
      } else {
        console.warn('Selected option not found in the options list');
      }
    }
    if (this.surveyViewSelected !== null && this.surveyViewSelected !== undefined) {
      const selectedViewOption = this.surveyViewDropdownList.find(option => option.item_id.toString() == this.surveyViewSelected);
      if (selectedViewOption) {
        this.createServeyForm.controls['surveyViewOption'].setValue(selectedViewOption.item_id);
      } else {
        console.warn('Selected option not found in the options list');
      }
    }

    this.createServeyForm.controls['surveyStartDate'].setValue(this.formatDate(this.createServeyForm.controls['surveyStartDate'].value));
    this.createServeyForm.controls['surveyEndDate'].setValue(this.formatDate(this.createServeyForm.controls['surveyEndDate'].value));

    this.createServeyForm.value.user_id = this.userId;
    this.createServeyForm.value.team_id = this.teamId;
    if (this.userRole == 'admin' || this.userRole == 'functionary') {
      this.createServeyForm.value.approved_status = 1;
    } else {
      this.createServeyForm.value.approved_status = 0;
    }

    var formData: any = new FormData();
    for (const key in this.createServeyForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.createServeyForm.value, key)) {
        const element: any = this.createServeyForm.value[key];
        if (key == 'surveyNotificationOption') {
          if (this.notificationOption) {
            formData.append('surveyNotificationOption', JSON.stringify([this.notificationOption.toString()]));
          } else {
            formData.append('surveyNotificationOption', '[]');
          }
        }
        if (key == 'survey_Answers') {
          formData.append('survey_Answers', JSON.stringify(element));
        }
        if (key == 'groupType') {
          formData.append('groupType', JSON.stringify(element));
        }
        if (key == 'image') {
          formData.append('image', element);
        }
        if (key == 'tags') {
          formData.append('tags', JSON.stringify(element));
        } else {
          if (key != 'image' && key != 'survey_Answers' && key != 'surveyNotificationOption' && key != 'groupType' && key != 'tags') {
            formData.append(key, element);
          }
        }
      }
    }

    if (this.createServeyForm.valid) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createSurvey', formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.formSubmit = false;
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'Survey', (error: any) => {});

          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          this.socket.emit('pushNotify', 'surveyCreated');
          setTimeout(() => {
            this.router.navigate(['/web/survey']);
          }, 2000);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  /**
   * Function is used to get end date
   * @author  MangoIt Solutions
   */
  getEndDate() {
    this.createServeyForm.get('surveyStartDate').valueChanges.subscribe(value => {
      this.minDate = value;
    });
    if (this.minDate != undefined) {
      return this.minDate;
    } else {
      return this.getToday();
    }
  }

  onCheckboxChange(e: Event) {
    const surveyNotificationOption: UntypedFormArray = this.createServeyForm.get('surveyNotificationOption') as UntypedFormArray;
    if (e.target['checked']) {
      surveyNotificationOption.push(new UntypedFormControl(e.target['value']));
    } else {
      let i: number = 0;
      if (surveyNotificationOption.controls && surveyNotificationOption.controls.length > 0) {
        surveyNotificationOption.controls.forEach((item: UntypedFormControl) => {
          if (item.value == e.target['value']) {
            surveyNotificationOption.removeAt(i);
            return;
          }
          i++;
        });
      }
    }
  }

  onTypeSelect(item: { item_id: string; item_text: string }) {
    this.surveyType = item.item_id;
    if (this.surveyType == 'Group') {
      this.createServeyForm.get('groupType').setValidators(Validators.required);
      this.createServeyForm.get('groupType').updateValueAndValidity();
    } else if (this.surveyType == 'All Club') {
      this.createServeyForm.get('groupType').clearValidators();
      this.createServeyForm.get('groupType').updateValueAndValidity();
      this.selectedGroup = [];
    }
  }

  changeType() {
    if (this.createServeyForm.controls.surveyType.status == 'INVALID') {
      this.createServeyForm.controls['groupType'].setValue('');
      this.surveyType = null;
      this.surveyType = '';
    }
  }

  getGroups() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'teamgroups/' + this.teamId, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData && respData.length > 0) {
        Object(respData).forEach((val, key) => {
          this.groupTypeDropdownList.push({ id: val.id, name: val.name });
        });
      }
      this.groupTypeDropdownSettings = {
        singleSelection: true,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: false,
        closeDropDownOnSelection: true,
      };
    });
  }

  onGroupTypeSelect(item: { id: number; name: string }) {
    this.selectedGroup[0] = item.id;
  }

  onGroupTypeDeSelect(item: { id: number; name: string }) {
    this.selectedGroup = [];
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  onCancel() {
    window.history.back();
  }

  /**
   * Function is used to validate file type is image and upload images
   * @author  MangoIt Solutions
   * @param   {}
   * @return  error message if file type is not image or application or text
   */
  errorImage: any = { isError: false, errorMessage: '' };
  uploadFile(event: Event) {
    var file: File = (event.target as HTMLInputElement).files[0];
    this.imageFile = file;

    if (file) {
      this.image = null;
      this.croppedImage = '';
      this.fileToReturn = null;
      this.imageChangedEvent = null;
      $('.preview_img').attr('src', 'assets/img/event_upload.png');
      const mimeType: string = file.type;
      const mimeSize: number = file.size;
      this.imgName = file.name;

      if (mimeType.match(/image\/*/) != null || mimeType.match(/application\/*/) != null || mimeType.match(/text\/*/) != null) {
        if (mimeType.match(/application\/*/) || mimeType.match(/text\/*/)) {
          if (mimeSize > 20000000) {
            this.docErrorMsg = true;
            this.errorImage = { isError: true, errorMessage: this.language.create_message.file_size };
            setTimeout(() => {
              this.errorImage = { Error: false, errorMessage: '' };
            }, 3000);
            this.image = null;
            $('.preview_txt').hide();
            $('.preview_txt').text('');
          } else {
            this.errorImage = { isError: false };
            this.docErrorMsg = false;
            this.createServeyForm.patchValue({
              image: file,
            });
            this.createServeyForm.get('image').updateValueAndValidity();
            this.image = file;
            const reader: FileReader = new FileReader();
            reader.readAsDataURL(file);
            var url: any;
            reader.onload = _event => {
              url = reader.result;
              $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
            };
            $('.preview_txt').show();
            $('.preview_txt').text(file.name);
          }
        }
        if (mimeType.match(/image\/*/)) {
          this.fileChangeEvent(event);
        }
      }
    } else {
    }
  }

  fileChangeEvent(event: any): void {
    if (event && event.type == 'change') {
      this.croppedImage = '';
      this.imageChangedEvent = null;
      $('.preview_txt').hide();
      $('.preview_txt').text('');
      this.isImage = true;
    }
    this.imageChangedEvent = event;
    this.file = (event.target as HTMLInputElement).files[0];
    var mimeType: string = this.file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.errorImage = { isError: true, errorMessage: this.language.error_message.common_valid };
    }
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
        if (this.imageChangedEvent?.target['files'][0]?.name) {
          this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
          this.createServeyForm.patchValue({ image: this.fileToReturn });
          this.createServeyForm.get('image').updateValueAndValidity();
          $('.preview_txt').show(this.fileToReturn.name);
          $('.preview_txt').text(this.fileToReturn.name);
        }
      });
  }

  /**
   * Function is used to get tags data
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all tags
   */
  getAllTags() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'tags?type=survey', null).subscribe((respData: any) => {
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
    const formArray: FormArray = this.createServeyForm.get('tags') as FormArray;
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
    const formArray: FormArray = this.createServeyForm.get('tags') as FormArray;
    const index = this.tagsName.indexOf(tag);
    if (index >= 0) {
      this.tagsName.splice(index, 1);
      formArray.removeAt(index);
      formArray.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event && event.option && event.option.viewValue) {
      const formArray: any = this.createServeyForm.get('tags') as FormArray;

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
    this.breadCrumbItems = [{ label: this.language.menu.organizer, link: '/web/organizer' }, { label: this.language.Survey.create_survey }];
  }

  imageLoaded() {}

  cropperReady() {
    /* cropper ready */
    this.isImage = false;
  }

  loadImageFailed() {
    /* show message */
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }

  private formatDate(date: Date): any {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
