import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CreateAccess, LoginDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css'],
})
export class EmailTemplateComponent implements OnInit, OnDestroy {
  language: any;

  createAccess: CreateAccess;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  file: File;
  fileToReturn: File;
  messageSubmitted: boolean = false;
  messageForm: UntypedFormGroup;
  responseMessage: string = null;
  visiblityDropdownSettings: IDropdownSettings;
  userDetails: LoginDetails;
  selectedVisiblity: number = null;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  visiblity: { id: string; name: string }[] = [];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    translate: 'no',
    sanitize: true,
    toolbarPosition: 'top',
    defaultFontName: 'Arial',
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
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  imageFile: File;
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(
    private lang: LanguageService,
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private themes: ThemeService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService
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
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.initBreadcrumb();
    this.visiblity = [
      { id: 'course', name: this.language.header.course },
      { id: 'updatedcourse', name: this.language.courses.update_course },
      { id: 'instructor', name: this.language.room.instructor },
      { id: 'survey', name: this.language.Survey.survey },
    ];

    this.visiblityDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.messageForm = new UntypedFormGroup({
      template_type: new UntypedFormControl('', Validators.required),
      file: new UntypedFormControl('', Validators.required),
      subject: new UntypedFormControl('', Validators.required),
      header_content: new UntypedFormControl('', Validators.required),
      template_body: new UntypedFormControl('', Validators.required),
      footer_content: new UntypedFormControl('', Validators.required),
      email_url: new UntypedFormControl('', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
    });
  }

  /**
   * Function is used to create Email Template
   * @author  MangoIt Solutions
   */
  messageProcess() {
    this.messageSubmitted = true;
    this.messageForm.controls['template_type'].setValue(this.selectedVisiblity);
    if (this.messageForm.valid) {
      var formData: FormData = new FormData();
      for (const key in this.messageForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.messageForm.value, key)) {
          const element = this.messageForm.value[key];
          if (key == 'template_type') {
            formData.append('template_type', element);
          }
          if (key == 'file') {
            formData.append('file', element);
          }
          if (key == 'subject') {
            formData.append('subject', element);
          }
          if (key == 'header_content') {
            formData.append('header_content', element);
          }
          if (key == 'template_body') {
            formData.append('template_body', element);
          }
          if (key == 'footer_content') {
            formData.append('footer_content', element);
          }
          if (key == 'email_url') {
            formData.append('url', element);
          }
        }
      }
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createEmailTemplate', formData).subscribe(
        (respData: any) => {
          this.authService.setLoader(false);
          this.messageSubmitted = false;
          if (respData['isError'] == false) {
            this.notificationService.showSuccess(respData['result']['message'], 'Success');
            setTimeout(() => {
              this.router.navigate(['/web/show-email']);
            }, 2000);
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
            this.authService.setLoader(false);
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  /**
   * Function is used to select visiblity
   * @author  MangoIt Solutions
   */
  onVisiblitySelect(item: { id: number; name: string }) {
    this.selectedVisiblity = item.id;
  }

  /**
   * Function is used to de select visiblity
   * @author  MangoIt Solutions
   */
  onVisiblityDeSelect(item: { id: string; name: string }) {
    this.selectedVisiblity = null;
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
        this.messageForm.patchValue({ file: this.fileToReturn });
        this.messageForm.get('file').updateValueAndValidity();
        $('.preview_txt').show(this.fileToReturn.name);
        $('.preview_txt').text(this.fileToReturn.name);
      });
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Admin', link: '/web/banner-list' }, { label: this.language.email.email_template }];
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

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
