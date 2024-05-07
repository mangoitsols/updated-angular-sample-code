import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { Subscription } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
import { LoginDetails, ThemeType } from '@core/models';
import { DatePipe } from '@angular/common';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-create-banner',
  templateUrl: './create-banner.component.html',
  styleUrls: ['./create-banner.component.css'],
  providers: [DatePipe],
})
export class CreateBannerComponent implements OnInit, OnDestroy {
  language: any;
  createBannerForm: UntypedFormGroup;
  formSubmit: boolean = false;
  setTheme: ThemeType;
  file: File;
  fileToReturn: File;
  croppedImage: string = '';
  imageChangedEvent: Event = null;
  image: File;
  isImage: boolean = false;
  private activatedSub: Subscription;
  bannerDisplayOption: { name: any; id: string }[];
  displayedDropdownSettings: IDropdownSettings;
  bannerDispledSelected: any[] = [];
  userData: LoginDetails;
  imgHeight: any;
  imgWidth: any;
  minDate: any;
  breadCrumbItems: Array<BreadcrumbItem>;
  invoiceDropdownSettings: IDropdownSettings;
  invoiceDropdownList: { item_id: number; item_text: string }[] = [];
  categoryDropdownSettings: IDropdownSettings;
  bannerCategoryOption: { item_id: number; item_text: string }[] = [];
  placementDropdownSettings: IDropdownSettings;
  bannerPlacementOption: { item_id: number; item_text: string }[] = [];

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
  imageFile: File;
  selectedInvoiceOption: any;
  selectedCategoryOption: any[] = [];
  selectedPlacementOption: any[] = [];
  socket: Socket;

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
    this.socket = io(environment.serverUrl);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.authService.setLoader(false);
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.language = this.lang.getLanguageFile();
    this.initBreadcrumb();

    this.bannerCategoryOption = [
      { item_id: 1, item_text: this.language.banner.app_sponsor },
      { item_id: 2, item_text: this.language.banner.sponsor },
      { item_id: 3, item_text: this.language.banner.free_space },
    ];

    this.bannerPlacementOption = [
      { item_id: 1, item_text: this.language.banner.dashboard },
      // { item_id: 2, item_text: this.language.banner.all_news },
      { item_id: 3, item_text: this.language.banner.news_details },
      // { item_id: 4, item_text: this.language.banner.all_groups },
      // { item_id: 5, item_text: this.language.banner.groups_details },
    ];

    this.bannerDisplayOption = [
      { name: this.language.banner.mobile_app, id: '1' },
      { name: this.language.banner.desktop, id: '2' },
      // { name: this.language.banner.notification_section, id: '3' },
      { name: this.language.banner.everywhere, id: '4' },
    ];

    this.displayedDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.createBannerForm = this.formBuilder.group({
      bannerName: ['', [Validators.required]],
      description: ['', Validators.required],
      bannerStartDate: ['', Validators.required],
      bannerEndDate: ['', Validators.required],
      image: ['', Validators.required],
      redirectLink: ['', Validators.compose([Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')])],
      status: [''],
      invoice: ['', Validators.required],
      category: ['', Validators.required],
      placement: ['', Validators.required],
      display: ['', Validators.required],
    });

    this.invoiceDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.invoiceDropdownList = [
      { item_id: 0, item_text: this.language.banner.created },
      { item_id: 1, item_text: this.language.banner.paid },
      { item_id: 2, item_text: this.language.banner.not_paid },
    ];

    this.categoryDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };

    this.placementDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };
  }

  get formControls() {
    return this.createBannerForm.controls;
  }

  //for invoice selection options
  onInvoiceSelect(item: { item_id: number; item_text: string }) {
    this.selectedInvoiceOption = item.item_id;
  }

  /**
   * Function is used to select category
   * @author  MangoIt Solutions
   */
  onCategorySelect(item: { item_id: number; name: string }) {
    this.selectedCategoryOption.push(item.item_id);
  }

  /**
   * Function is used to de select user
   * @author  MangoIt Solutions
   */
  onCategoryDeSelect(item: { item_id: number; name: string }) {
    this.selectedCategoryOption.forEach((value, index) => {
      if (value == item.item_id) this.selectedCategoryOption.splice(index, 1);
    });
  }

  /**
   * Function is used to select placement
   * @author  MangoIt Solutions
   */
  onPlacementSelect(item: { item_id: number; name: string }) {
    this.selectedPlacementOption.push(item.item_id);
  }

  /**
   * Function is used to de select placement
   * @author  MangoIt Solutions
   */
  onPlacementDeSelect(item: { item_id: number; name: string }) {
    this.selectedPlacementOption.forEach((value, index) => {
      if (value == item.item_id) this.selectedPlacementOption.splice(index, 1);
    });
  }

  /**
   * Function for create a banner
   * @author  MangoIt Solutions(M)
   * @param   {Banner Id}
   * @return  {}
   */
  bannerProcess() {
    this.formSubmit = true;
    this.createBannerForm.controls['display'].setValue(this.bannerDispledSelected);
    this.createBannerForm.controls['bannerStartDate'].setValue(this.formatDate(this.createBannerForm.controls['bannerStartDate'].value));
    this.createBannerForm.controls['bannerEndDate'].setValue(this.formatDate(this.createBannerForm.controls['bannerEndDate'].value));
    this.createBannerForm.value.author = this.userData.userId;
    this.createBannerForm.value.team_id = this.userData.team_id;
    this.createBannerForm.value.status = this.createBannerForm.value.status ? 0 : 1;

    if (this.selectedInvoiceOption !== null && this.selectedInvoiceOption !== undefined) {
      const selectedOption = this.invoiceDropdownList.find(option => option.item_id.toString() == this.selectedInvoiceOption);
      if (selectedOption) {
        this.createBannerForm.value['invoice'] = selectedOption.item_id;
      } else {
        console.warn('Selected option not found in the options list');
      }
    }

    var formData: any = new FormData();
    for (const key in this.createBannerForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.createBannerForm.value, key)) {
        const element: any = this.createBannerForm.value[key];
        if (key == 'category') {
          formData.append('category', JSON.stringify(this.selectedCategoryOption));
        }

        if (key == 'placement') {
          formData.append('placement', JSON.stringify(this.selectedPlacementOption));
        }
        if (key == 'display') {
          formData.append('display', JSON.stringify(element));
        }
        if (key == 'image') {
          formData.append('file', element);
        } else {
          if (key != 'image' && key != 'category' && key != 'placement' && key != 'display') {
            formData.append(key, element);
          }
        }
      }
    }

    if (this.createBannerForm.valid) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createBanner', formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.formSubmit = false;
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'Banner', (error: any) => {});
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          setTimeout(() => {
            this.router.navigate(['/web/banner-list']);
          }, 1000);
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
    this.createBannerForm.get('bannerStartDate').valueChanges.subscribe(value => {
      this.minDate = value;
    });
    if (this.minDate != undefined) {
      return this.minDate;
    } else {
      return this.getToday();
    }
  }

  /**
   * Function is used to select checkbox Placement option
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {Array} numbers array
   */
  onPlacementChange(e: Event) {
    const placementOption: FormArray = this.createBannerForm.get('placement') as FormArray;
    if (e.target['checked']) {
      placementOption.push(new FormControl(e.target['value']));
    } else {
      let i: number = 0;
      if (placementOption.controls && placementOption.controls.length > 0) {
        placementOption.controls.forEach((item: UntypedFormControl) => {
          if (item.value == e.target['value']) {
            placementOption.removeAt(i);
            return;
          }
          i++;
        });
      }
    }
  }

  /**
   * Function is used to select dropdown display Option
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {Array} numbers array
   */
  onbannerDispledSelect(item: any) {
    this.bannerDispledSelected.push(item.id);
  }

  /**
   * Function is used to remove dropdown display option
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {Array} numbers array
   */
  onbannerDispledDeSelect(item: any) {
    this.bannerDispledSelected = [];
  }

  /**
   * Function is used to today date
   * @author  MangoIt Solutions(M)
   */

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  onCancel() {
    window.history.back();
  }

  /**
   * Function is used to validate file type is image and upload images
   * @author  MangoIt Solutions(M)
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
        this.createBannerForm.patchValue({ image: this.fileToReturn });
        this.createBannerForm.get('image').updateValueAndValidity();
        $('.preview_txt').show(this.fileToReturn.name);
        $('.preview_txt').text(this.fileToReturn.name);
      });
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Admin', link: '/web/banner-list' }, { label: this.language.banner.banner }];
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
