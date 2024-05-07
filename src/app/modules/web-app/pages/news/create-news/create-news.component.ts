import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CommunityGroup, LoginDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-create-news',
  templateUrl: './create-news.component.html',
  styleUrls: ['./create-news.component.css'],
  providers: [DatePipe],
})
export class CreateNewsComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  language: any;
  submitted: boolean = false;
  createNewsForm: UntypedFormGroup;
  visiblityDropdownSettings: IDropdownSettings;
  dropdownSettings: IDropdownSettings;
  groupDropdownSettings: IDropdownSettings;
  userDetails: LoginDetails;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  file: File;
  fileToReturn: File;
  responseMessage: string = null;
  visiblity: { id: number; name: string }[] = [];
  groupSelectedItem: number[] = [];
  groupVisiblity: number;
  teamId: number;
  groups: CommunityGroup;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  tagsName: any[] = [];
  tagCtrl = new FormControl('');
  filteredTags: Observable<any[]>;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  allTags: any[] = [];
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: any;
  removable = true;
  imageFile: File;
  socket: Socket;

  constructor(
    private authService: AuthService,
    private router: Router,
    public formBuilder: UntypedFormBuilder,
    private lang: LanguageService,
    private themes: ThemeService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService
  ) {}

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    translate: 'no',
    sanitize: true,
    toolbarPosition: 'top',
    defaultFontName: 'Gellix',
    defaultFontSize: '2',
    defaultParagraphSeparator: 'p',
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
  };

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
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = this.userDetails.team_id;

    this.getGroup();
    this.initBreadcrumb();

    if (localStorage.getItem('create-message')) localStorage.removeItem('create-message');

    this.visiblity = [
      { id: 0, name: this.language.create_news.title },
      { id: 2, name: this.language.create_news.group_news },
      { id: 3, name: this.language.create_news.chairman },
    ];

    if (this.userDetails.roles[0] == 'member_light_admin') {
      this.visiblity = [{ id: 0, name: this.language.create_news.visible_everyone }];
    }

    this.visiblityDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
      closeDropDownOnSelection: true,
    };

    this.groupDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
    };

    this.createNewsForm = this.formBuilder.group({
      title: ['', [Validators.required, this.noWhitespace]],
      content: ['', Validators.required],
      add_image: ['', Validators.required],
      visible_dropdown: ['', Validators.required],
      group_dropdown: [''],
      show_guest: [''],
      isHighlighted: [''],
      tags: this.formBuilder.array([]),
    });

    this.getAllTags();
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice()))
    );
  }

  noWhitespace(control: UntypedFormControl) {
    if (control.value.length != 0) {
      let isWhitespace: boolean = (control.value || '').trim().length === 0;
      let isValid: boolean = !isWhitespace;
      return isValid ? null : { whitespace: true };
    } else {
      let isValid: boolean = true;
      return isValid ? null : { whitespace: true };
    }
  }

  /**
   * Function is used to get groups list as per team id
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} groups object
   */
  getGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamgroups/' + this.teamId, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.groups = respData;
      });
    }
  }

  /**
   * Function is used to add validation as per Visiblity
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  onVisiblitySelect(item: { id: number; name: string }) {
    this.groupVisiblity = item.id;
    if (this.groupVisiblity == 2) {
      this.createNewsForm.get('group_dropdown').setValidators(Validators.required);
      this.createNewsForm.get('group_dropdown').updateValueAndValidity();
    } else {
      this.createNewsForm.get('group_dropdown').clearValidators();
      this.createNewsForm.get('group_dropdown').updateValueAndValidity();
    }
  }

  /**
   * Function is used to select Group
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  onGroupItemSelect(item: { id: number; name: string }) {
    this.groupSelectedItem.push(item.id);
  }

  /**
   * Function is used to DeSelect Participant
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  onGroupItemDeSelect(item: { id: number; name: string }) {
    // this.groupSelectedItem.push(item.id);
    const index = this.groupSelectedItem.indexOf(item.id);
    if (index > -1) {
      this.groupSelectedItem.splice(index, 1);
    }
  }

  /**
   * Function is used to create news and send data in formData formate
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {string} return success message
   */
  createNews() {
    this.submitted = true;
    if (sessionStorage.getItem('token') && this.createNewsForm.valid && !this.errorImage.isError) {
      // this.authService.setLoader(true);
      var approved_statud: number = 0;
      var tags: any = null;
      var attachment: any = null;
      var show_guest: boolean = this.createNewsForm.get('show_guest').value;
      var isHighlighted: boolean = this.createNewsForm.get('isHighlighted').value;
      if (this.userDetails.roles[0] == 'admin') {
        approved_statud = 1;
      }
      var formData: any = new FormData();
      formData.append('file', this.createNewsForm.get('add_image').value);
      formData.append('team_id', this.userDetails.team_id);
      formData.append('title', this.createNewsForm.get('title').value);
      formData.append('headline', this.createNewsForm.get('content').value);
      formData.append('text', this.createNewsForm.get('content').value);
      formData.append('author', localStorage.getItem('user-id'));
      formData.append('priority', 1);

      if (attachment == null || tags == null) {
        formData.append('attachment', attachment);
        formData.append('tags', tags);
      }

      formData.append('audience', this.groupVisiblity);
      formData.append('approved_statud', approved_statud);

      if (this.groupSelectedItem?.length > 0) {
        var uniqueGroupItem = this.authService.uniqueData(this.groupSelectedItem);
        formData.append('groups', '[' + uniqueGroupItem + ']');
      }

      if (show_guest) {
        formData.append('show_guest_list', show_guest.toString());
      } else {
        formData.append('show_guest_list', false);
      }

      if (isHighlighted) {
        formData.append('highlighted', isHighlighted.toString());
      } else {
        formData.append('highlighted', false);
      }

      formData.append('publication_date_to', new Date().toISOString());
      formData.append('publication_date_from', new Date().toISOString());

      formData.append('news_tags', JSON.stringify(this.createNewsForm.get('tags').value));
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createNews', formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.submitted = false;
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'News', (error: any) => {});
          this.notificationService.showSuccess(this.language.response_message.news_success, 'Success');
          setTimeout(() => {
            this.router.navigate(['/web/clubwall']);
          }, 1500);
        } else if (respData['code'] == 400) {
          this.authService.setLoader(false);
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  onCancel() {
    //window.history.back();
    this.router.navigate(['/web/clubwall']);
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
        }, 2000);
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
    this.errorImage = { isError: false, errorMessage: '' };
    let imgData = this.commonFunctionService.getAspectRatio(this.imgHeight, this.imgWidth);
    this.croppedImage = event.base64;
    this.imageCompress
      .compressFile(this.croppedImage, -1, imgData[2], 100, imgData[0], imgData[1]) // 50% ratio, 50% quality
      .then(compressedImage => {
        this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
        this.createNewsForm.patchValue({ add_image: this.fileToReturn });
        this.createNewsForm.get('add_image').updateValueAndValidity();
        $('.preview_txt').show(this.fileToReturn.name);
        $('.preview_txt').text(this.fileToReturn.name);
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
    this.authService.memberSendRequest('get', 'tags?type=news', null).subscribe((respData: any) => {
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
    const formArray: FormArray = this.createNewsForm.get('tags') as FormArray;
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
    const formArray: FormArray = this.createNewsForm.get('tags') as FormArray;
    const index = this.tagsName.indexOf(tag);
    if (index >= 0) {
      this.tagsName.splice(index, 1);
      formArray.removeAt(index);
      formArray.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event && event.option && event.option.viewValue) {
      const formArray: any = this.createNewsForm.get('tags') as FormArray;

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

  imageLoaded() {}

  cropperReady() {
    /* cropper ready */
    this.isImage = false;
  }

  loadImageFailed() {
    /* show message */
  }

  private initBreadcrumb(): void {
    this.breadcrumbs = [
      {
        label: this.language.club_events.clubwall,
        link: '/web/clubwall/club-news',
      },
      { label: this.language.club_wall.create_news, link: '' },
    ];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
