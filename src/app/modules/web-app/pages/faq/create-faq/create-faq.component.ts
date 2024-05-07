import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { NgxImageCompressService } from 'ngx-image-compress';
import { FAQCategory, LoginDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-create-faq',
  templateUrl: './create-faq.component.html',
  styleUrls: ['./create-faq.component.css'],
})
export class CreateFaqComponent implements OnInit, OnDestroy {
  FAQForm: UntypedFormGroup;
  FAQSubmit: boolean = false;
  language: any;
  imgErrorMsg: boolean = false;
  docErrorMsg: boolean = false;
  responseMessage: string = null;
  categoryDropdownSettings: IDropdownSettings;
  positionDropdownSettings: IDropdownSettings;
  file: File;
  fileToReturn: File;
  imageChangedEvent: Event = null;
  image: File;
  imgName: string;
  catListArray: { id: number; name: number }[] = [];
  positionList: { id: number; name: number }[] = [];
  categorySelectedItem: number;
  positionSelectedItem: number;
  FaqCategory: FAQCategory;
  croppedImage: string = '';
  teamId: number;
  setTheme: ThemeType;
  approved_status: number;
  breadCrumbItems: Array<BreadcrumbItem>;
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
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  imageFile: File;

  constructor(
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private themes: ThemeService,
    private lang: LanguageService,
    public authService: AuthService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService
  ) {}

  ngOnInit() {
    this.socket = io(environment.serverUrl);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    let userId: string = localStorage.getItem('user-id');
    this.language = this.lang.getLanguageFile();
    let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
    if (userData.isAdmin || userData.isFunctionary) {
      this.approved_status = 1;
    } else {
      this.approved_status = 0;
    }
    this.teamId = userData.team_id;
    this.categoryDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      closeDropDownOnSelection: true,
      searchPlaceholderText: this.language.header.search,
    };
    this.getCategory();
    this.initBreadcrumb();
    this.positionList = [
      { id: 1, name: 1 },
      { id: 2, name: 2 },
      { id: 3, name: 3 },
      { id: 4, name: 4 },
      { id: 5, name: 5 },
      { id: 6, name: 6 },
      { id: 7, name: 7 },
      { id: 8, name: 8 },
      { id: 9, name: 9 },
      { id: 10, name: 10 },
    ];

    this.positionDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };
    this.FAQForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', Validators.required],
      position: [''],
      description: ['', Validators.required],
      image: [''],
      author: [userId],
      approved_status: [this.approved_status],
    });
  }

  getCategory() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'category', null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData && respData.length > 0) {
        Object(respData).forEach((key, value) => {
          this.catListArray.push({ id: key.id, name: key.category_title });
        });
      }
    });
  }

  createFAQ() {
    this.FAQSubmit = true;

    // this.FAQForm.controls['category'].setValue(this.categorySelectedItem);
    this.FAQForm.value['team_id'] = this.teamId;
    var formData: any = new FormData();
    for (const key in this.FAQForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.FAQForm.value, key)) {
        const element: any = this.FAQForm.value[key];
        if (key == 'title') {
          formData.append('title', element);
        }
        if (key == 'category') {
          formData.append('category', this.categorySelectedItem);
        }
        if (key == 'position') {
          if (this.positionSelectedItem) {
            formData.append('position', this.positionSelectedItem);
          } else {
            formData.append('position', element);
          }
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
        if (key == 'author') {
          formData.append('author', element);
        }
        if (key == 'approved_status') {
          formData.append('approved_status', element);
        }
      }
    }
    if (this.FAQForm.valid) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createFaq', formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'FAQ', (error: any) => {});
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          setTimeout(() => {
            const url: string[] = ['/web/vereins-faq'];
            this.router.navigate(url);
          }, 2000);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  onCategoryItemSelect(item: { id: number; name: string }) {
    this.categorySelectedItem = item.id;
  }

  onCategoryItemDeSelect(item: { id: number; name: string }) {
    this.categorySelectedItem = null;
  }

  onPositionItemSelect(item: { id: number; name: string }) {
    this.positionSelectedItem = item.id;
  }

  onPositionItemDeSelect(item: { id: number; name: string }) {
    this.positionSelectedItem = null;
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
      this.FAQForm.value['image'] = '';
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
            this.FAQForm.patchValue({
              image: file,
            });
            this.FAQForm.get('image').updateValueAndValidity();
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
        this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
        this.FAQForm.patchValue({ image: this.fileToReturn });
        this.FAQForm.get('image').updateValueAndValidity();
        $('.preview_txt').show(this.fileToReturn.name);
        $('.preview_txt').text(this.fileToReturn.name);
      });
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Organizer', link: ' ' }, { label: this.language.create_faq.create_faqs }];
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
}
