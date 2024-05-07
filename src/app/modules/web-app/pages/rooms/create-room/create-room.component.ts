import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subscription } from 'rxjs';
import { NgxImageCompressService } from 'ngx-image-compress';
import { LoginDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService, WeekdaysService } from '@core/services';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
declare var $: any;

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css'],
})
export class CreateRoomComponent implements OnInit, OnDestroy {
  language: any;
  roomForm: UntypedFormGroup;
  weekdayList: UntypedFormArray;
  formSubmit: boolean = false;
  checkNum: boolean = false;
  roomsSubmitted: boolean = false;
  fileToReturn: File;
  file: File;
  userId: string;
  setTheme: ThemeType;
  responseMessage: string;
  teamId: number;
  indax: number;
  weekdayArray: { name: any; id: number }[];
  weekdayDropdownSettings: object;
  selectDay: any[] = [];
  croppedImage: string = '';
  imageChangedEvent: Event;
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
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  minDate: any;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl('');
  filteredTags: Observable<any[]>;
  tagsName: any[] = [];
  allTags: any[] = [];
  tags: any;
  selectable = true;
  removable = true;
  addOnBlur = false;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  visibilityDropdownSettings: IDropdownSettings;
  visibilityDropdownList: { item_id: number; item_text: string }[] = [];
  selectedType: any[] = [];
  socket: Socket;
  breadCrumbItems: Array<BreadcrumbItem>;
  imageFile: File;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private themes: ThemeService,
    private lang: LanguageService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
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
    let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = userData.team_id;
    this.userId = localStorage.getItem('user-id');
    this.roomForm = this.formBuilder.group({
      name: ['', Validators.required],
      room_email: ['', [Validators.required, Validators.email]],
      room_address: ['', Validators.required],
      no_of_persons: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      image: ['', Validators.required],
      description: [''],
      approved_status: [0],
      author: [this.userId],
      weekdays: this.formBuilder.array([
        this.formBuilder.group({
          day: ['', Validators.required],
          time_from: ['', Validators.required],
          time_to: ['', Validators.required],
        }),
      ]),
      tags: this.formBuilder.array([]),
      type: ['', Validators.required],
      phone_no: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
    });
    this.initBreadcrumb();

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice()))
    );

    this.weekdayArray = this.weekDayService.getWeekdayArray();

    this.weekdayDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      selectAllText: false,
      enableCheckAll: false,
      unSelectAllText: false,
      closeDropDownOnSelection: true,
    };

    this.visibilityDropdownList = this.weekDayService.courseVisibilityDropdownList();

    this.visibilityDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    //to set the default value of instructor_type
    this.selectedType.push({ item_id: 0, item_text: this.language.courses.extern });

    this.getAllTags();
  }

  get weekdays() {
    return this.roomForm.get('weekdays') as UntypedFormArray;
  }

  addAvailableTimes() {
    if (this.errorTime.isError == false) {
      if (this.weekdays.valid) {
        const newAvailableTimes: UntypedFormGroup = this.formBuilder.group({
          day: ['', Validators.required],
          time_from: ['', Validators.required],
          time_to: ['', Validators.required],
        });
        this.weekdays.push(newAvailableTimes);
      }
    }
  }

  removeAvailableTimes(index) {
    this.errorTime = { isError: false, errorMessage: '' };
    this.weekdays.removeAt(index);
  }

  onWeekdayItemSelect(item: any) {
    this.selectDay.push(item.id);
  }

  onWeekdayItemDeSelect(item: string) {
    this.selectDay = [];
  }

  checkNumber() {
    if (this.roomForm.value['no_of_persons'] == '') {
      this.checkNum = false;
    } else if (this.roomForm.value['no_of_persons'] <= 0) {
      this.checkNum = true;
    } else {
      this.checkNum = false;
    }
  }

  createRoomForm() {
    this.formSubmit = true;
    if (this.roomForm.valid && this.errorTime['isError'] == false) {
      const Instructortype = this.roomForm.value.type[0].item_id; // for adding the new(instructor) type

      for (let i = 0; i < this.roomForm.controls.weekdays.value.length; i++) {
        this.roomForm.value.weekdays[i].day = this.roomForm.controls.weekdays.value[i].day[0]?.id;
      }
      this.roomForm.value['team_id'] = this.teamId;
      if (this.roomForm.valid && this.roomForm.value['no_of_persons'] != '' && this.roomForm.value['no_of_persons'] > 0) {
        var formData: FormData = new FormData();
        for (const key in this.roomForm.value) {
          if (Object.prototype.hasOwnProperty.call(this.roomForm.value, key)) {
            const element: string = this.roomForm.value[key];
            if (key == 'name') {
              formData.append('name', element);
            }
            if (key == 'room_email') {
              formData.append('room_email', element);
            }
            if (key == 'room_address') {
              formData.append('room_address', element);
            }
            if (key == 'no_of_persons') {
              formData.append('no_of_persons', element);
            }
            if (key == 'weekdays') {
              formData.append('weekdays', JSON.stringify(element));
            }
            if (key == 'description') {
              formData.append('description', element);
            }
            if (key == 'image') {
              formData.append('file', element);
            }
            if (key == 'team_id') {
              formData.append('team_id', element);
            }
            if (key == 'tags') {
              formData.append('tags', JSON.stringify(element));
            }
            if (key == 'type') {
              formData.append('type', Instructortype);
            }
            if (key == 'phone_no') {
              formData.append('phone_no', element);
            } else {
              if (key != 'name' && key != 'room_email' && key != 'room_address' && key != 'no_of_persons' && key != 'weekdays' && key != 'description' && key != 'image' && key != 'team_id' && key != 'type' && key != 'tags' && key != 'phone_no') {
                formData.append(key, element);
              }
            }
          }
        }
      }

      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createRoom', formData).subscribe((respData: any) => {
        this.roomsSubmitted = false;
        if (respData['isError'] == false) {
          this.authService.setLoader(false);

          this.socket.emit('sendNotification', 'Room', (error: any) => {});

          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          setTimeout(() => {
            this.router.navigate(['web/room-detail/' + respData['result']['room']['id']]);
          }, 2000);
        } else if (respData['code'] == 400) {
          this.authService.setLoader(false);
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  errorTime: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  compareTwoTimes(item: number) {
    this.indax = item;
    this.errorTime = { isError: false, errorMessage: '' };
    for (let i = 0; i < this.roomForm?.controls?.weekdays?.value.length; i++) {
      if (
        this.roomForm?.controls?.weekdays?.value[i]?.['time_from'] != '' &&
        this.roomForm?.controls?.weekdays?.value[i]?.['time_to'] != '' &&
        (this.roomForm?.controls?.weekdays?.value[i]?.['time_from'] > this.roomForm?.controls?.weekdays?.value[i]?.['time_to'] || this.roomForm?.controls?.weekdays?.value[i]?.['time_from'] == this.roomForm?.controls?.weekdays?.value[i]?.['time_to'])
      ) {
        this.errorTime = { isError: true, errorMessage: this.language.error_message.end_time_same };
        return this.indax;
      } else {
        this.errorTime = { isError: false, errorMessage: '' };
      }
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
      const mimeSize: number = file.size;
      if (mimeType.match(/image\/*/) == null) {
        this.errorImage = {
          isError: true,
          errorMessage: this.language.error_message.common_valid,
        };
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
    var mimeType: string = this.file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.errorImage = {
        isError: true,
        errorMessage: this.language.error_message.common_valid,
      };
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
        this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
        this.roomForm.patchValue({ image: this.fileToReturn });
        this.roomForm.get('image').updateValueAndValidity();
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

  onCancel() {
    window.history.back();
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

  addTags(event: MatChipInputEvent): void {
    const formArray: FormArray = this.roomForm.get('tags') as FormArray;
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

  remove(tag: string): void {
    const formArray: FormArray = this.roomForm.get('tags') as FormArray;
    const index = this.tagsName.indexOf(tag);
    if (index >= 0) {
      this.tagsName.splice(index, 1);
      formArray.removeAt(index);
      formArray.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event && event.option && event.option.viewValue) {
      const formArray: any = this.roomForm.get('tags') as FormArray;

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
    this.breadCrumbItems = [{ label: 'Club-Tools', link: '' }, { label: this.language.room.create_room }];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
