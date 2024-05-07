import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { Subscription } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService, DOC_ORIENTATION } from 'ngx-image-compress';
import { LoginDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { DatePipe } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-update-banner',
  templateUrl: './update-banner.component.html',
  styleUrls: ['./update-banner.component.css'],
  providers: [DatePipe],
})
export class UpdateBannerComponent implements OnInit, OnDestroy {
  language: any;
  updateBannerForm: UntypedFormGroup;
  hasPicture: boolean = false;
  formSubmit: boolean = false;
  bannerCategoryOption: { item_id: number; item_text: string }[] = [];
  bannerPlacementOption: { item_id: number; item_text: string }[] = [];
  setTheme: ThemeType;
  file: File;
  fileToReturn: File;
  croppedImage: string = '';
  imageChangedEvent: Event = null;
  image: File;
  isImage: boolean = false;
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
  bannerDisplayOption: { name: any; id: string }[];
  displayedDropdownSettings: IDropdownSettings;
  bannerDispledSelected: any[] = [];
  userData: LoginDetails;
  bannerDetail: any;
  showBannerImage: any;
  bannerId: any;
  checkedStatus: any;
  bannerDisplayed: any[] = [];
  imgHeight: any;
  imgWidth: any;
  minDate: any;
  breadCrumbItems: Array<BreadcrumbItem>;
  imageFile: File;
  invoiceDropdownSettings: IDropdownSettings;
  invoiceDropdownList: { item_id: number; item_text: string }[] = [];
  selectedInvoiceOption: number;
  invoiceType: any;
  categoryDropdownSettings: IDropdownSettings;
  selectedCategoryOption: any[] = [];
  categoryType: any;
  placementDropdownSettings: IDropdownSettings;
  selectedPlacementOption: any[] = [];
  placementType: any[] = [];
  socket: Socket;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private lang: LanguageService,
    private themes: ThemeService,
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
    this.route.params.subscribe(params => {
      this.bannerId = params['bannerId'];
    });

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

    this.updateBannerForm = this.formBuilder.group({
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
      author: [''],
      team_id: [''],
    });
    this.getBannerInfo(this.bannerId);

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
    return this.updateBannerForm.controls;
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
    const isDuplicate = this.selectedCategoryOption.includes(item.item_id);

    if (!isDuplicate) {
      this.selectedCategoryOption.push(item.item_id);
    }
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
    const isDuplicate = this.selectedPlacementOption.includes(item.item_id);
    if (!isDuplicate) {
      this.selectedPlacementOption.push(item.item_id);
    }
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
   * Function for get Banner detail by Id
   * @author  MangoIt Solutions(M)
   * @param   {Banner Id}
   * @return  {Banner Detail} array of object
   */
  getBannerInfo(id: number) {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getBannerbyId/' + id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.bannerDetail = respData['result'];
        this.setBannerData(this.bannerDetail);
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  /**
   * Function is used to set the all values in the form
   * @author  MangoIt Solutions(M)
   * @param   {Banner detail by Id}
   * @return  {}
   */
  setBannerData(bannerInfo: any) {
    var date_to: string[];
    var date_from: string[];
    this.invoiceType = [];
    this.categoryType = [];
    this.placementType = [];

    this.updateBannerForm.controls['bannerName'].setValue(bannerInfo.bannerName);
    this.updateBannerForm.controls['description'].setValue(bannerInfo.description);
    this.updateBannerForm.controls['redirectLink'].setValue(bannerInfo.redirectLink);

    if (bannerInfo) {
      let tokenUrl = this.commonFunctionService.genrateImageToken(bannerInfo.id, 'banner');
      bannerInfo.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
      this.commonFunctionService.loadImage(bannerInfo.token);
      this.hasPicture = true;
      this.showBannerImage = bannerInfo.token.url;
      this.updateBannerForm.controls['image'].setValue(this.showBannerImage);
    }

    if (bannerInfo['bannerStartDate']) {
      date_from = bannerInfo['bannerStartDate'].split('T');
      this.updateBannerForm.controls['bannerStartDate'].setValue(date_from[0]);
    }

    if (bannerInfo['bannerEndDate']) {
      date_to = bannerInfo['bannerEndDate'].split('T');
      this.updateBannerForm.controls['bannerEndDate'].setValue(date_to[0]);
    }

    this.checkedStatus = bannerInfo['status'];
    this.updateBannerForm.controls['status'].setValue(this.checkedStatus);
    if (this.updateBannerForm.controls['invoice']) {
      let invoiceValue = bannerInfo.invoice;
      if (invoiceValue == 0) {
        this.invoiceType.push({ item_id: 0, item_text: this.language.banner.created });
      } else if (invoiceValue == 1) {
        this.invoiceType.push({ item_id: 1, item_text: this.language.banner.paid });
      } else if (invoiceValue == 2) {
        this.invoiceType.push({ item_id: 2, item_text: this.language.banner.not_paid });
      }
    }
    this.updateBannerForm.controls['invoice'].setValue(this.invoiceType);

    this.selectedCategoryOption = JSON.parse(bannerInfo.category);

    if (this.updateBannerForm.controls['category']) {
      let categoryArray = JSON.parse(bannerInfo.category);
      this.categoryType = categoryArray.map(categoryId => {
        if (categoryId === 1) {
          return { item_id: 1, item_text: this.language.banner.app_sponsor };
        } else if (categoryId === 2) {
          return { item_id: 2, item_text: this.language.banner.sponsor };
        } else if (categoryId === 3) {
          return { item_id: 3, item_text: this.language.banner.free_space };
        }
      });
    }

    this.updateBannerForm.controls['category'].setValue(this.categoryType);

    if (this.updateBannerForm.controls['placement']) {
      let placementArray = JSON.parse(bannerInfo.placement);
      this.placementType = placementArray.map(itemId => {
        if (itemId === 1) {
          return { item_id: 1, item_text: this.language.banner.dashboard };
        } else if (itemId === 2) {
          return { item_id: 2, item_text: this.language.banner.all_news };
        } else if (itemId === 3) {
          return { item_id: 3, item_text: this.language.banner.news_details };
        } else if (itemId === 4) {
          return { item_id: 4, item_text: this.language.banner.all_groups };
        } else if (itemId === 5) {
          return { item_id: 5, item_text: this.language.banner.groups_details };
        }
      });
    }
    this.updateBannerForm.controls['placement'].setValue(this.placementType);
    this.selectedPlacementOption = JSON.parse(bannerInfo.placement);

    if (this.checkedStatus == 0) {
      this.updateBannerForm.value['status'] = 'true';
    }

    if (bannerInfo['display']) {
      let bannerDisp = JSON.parse(bannerInfo['display']);
      if (this.bannerDisplayOption?.length > 0) {
        this.bannerDisplayOption.forEach((element: any) => {
          bannerDisp.forEach((elem: any) => {
            if (elem == element.id) {
              this.bannerDisplayed.push({ name: element.name, id: element.id });
              this.bannerDispledSelected.push(element.id);
            }
          });
        });
      }
      this.updateBannerForm.controls['display'].setValue(this.bannerDisplayed);
    }
  }

  /**
   * Function used to set the status toggle
   * @author  MangoIt Solutions(M)
   * @param   {Banner detail by Id}
   * @return  {}
   */
  toggleStatus() {
    this.checkedStatus = this.checkedStatus === 0 ? 1 : 0;
    this.updateBannerForm.controls['status'].setValue(this.checkedStatus);
  }

  /**
   * Function for update the changes on the banner
   * @author  MangoIt Solutions(M)
   * @param   {Banner detail by Id}
   * @return  {}
   */
  updateBannerProcess() {
    console.log(this.updateBannerForm);

    this.formSubmit = true;
    if (this.updateBannerForm.valid) {
      this.updateBannerForm.controls['display'].setValue(this.bannerDispledSelected);
      if (this.fileToReturn) {
        this.updateBannerForm.controls['image'].setValue(this.fileToReturn);
      } else {
        this.updateBannerForm.controls['image'].setValue(this.showBannerImage);
      }

      this.updateBannerForm.controls['author'].setValue(this.userData.userId);
      this.updateBannerForm.controls['team_id'].setValue(this.userData.team_id);

      this.updateBannerForm.value.status = this.checkedStatus;
      if (this.selectedInvoiceOption) {
        this.updateBannerForm.value['invoice'] = this.selectedInvoiceOption;
        this.updateBannerForm.controls['invoice'].setValue(this.selectedInvoiceOption);
      } else {
        this.updateBannerForm.controls['invoice'].setValue(this.bannerDetail['invoice']);
      }

      this.updateBannerForm.controls['bannerStartDate'].setValue(this.formatDate(this.updateBannerForm.controls['bannerStartDate'].value));
      this.updateBannerForm.controls['bannerEndDate'].setValue(this.formatDate(this.updateBannerForm.controls['bannerEndDate'].value));
      var formData: any = new FormData();
      for (const key in this.updateBannerForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.updateBannerForm.value, key)) {
          const element: any = this.updateBannerForm.value[key];
          if (key == 'category') {
            if (this.selectedCategoryOption) {
              formData.append('category', JSON.stringify(this.selectedCategoryOption));
            } else if (this.updateBannerForm.value['category']) {
              formData.append('category', this.bannerDetail['invoice']);
            }
          }
          if (key == 'placement') {
            if (this.selectedPlacementOption) {
              formData.append('placement', JSON.stringify(this.selectedPlacementOption));
            } else if (this.updateBannerForm.value['placement']) {
              formData.append('placement', this.bannerDetail['placement']);
            }
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

      this.authService.setLoader(true);
      this.authService.memberSendRequest('put', 'updateBanner/' + this.bannerId, formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.formSubmit = false;

        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'Banner', (error: any) => {});
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          setTimeout(() => {
            this.router.navigate(['/web/banner-list']);
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
    this.updateBannerForm.get('bannerStartDate').valueChanges.subscribe(value => {
      this.minDate = value;
    });
    if (this.minDate != undefined) {
      return this.minDate;
    } else {
      return this.updateBannerForm.controls['bannerStartDate'].value;
    }
  }

  /**
   * Function for select the status
   * @author  MangoIt Solutions(M)
   */
  checkStatusRadioBtn(val: any) {
    this.updateBannerForm.controls['status'].setValue('');
    this.updateBannerForm.controls['status'].setValue(val);
  }

  /**
   * Function for select the Invoices
   * @author  MangoIt Solutions(M)
   */
  checkInvoicesRadioBtn(value: any) {
    this.updateBannerForm.controls['invoice'].setValue('');
    this.updateBannerForm.controls['invoice'].setValue(value);
  }

  /**
   * Function is used to select checkbox Category option
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {Array} numbers array
   */
  oncategoryChange(e: Event) {
    const categoryOption: UntypedFormArray = this.updateBannerForm.get('category') as UntypedFormArray;
    if (e.target['checked']) {
      categoryOption.push(new UntypedFormControl(e.target['value']));
    } else {
      let i: number = 0;
      if (categoryOption.controls && categoryOption.controls.length > 0) {
        categoryOption.controls.forEach((item: UntypedFormControl) => {
          if (item.value == e.target['value']) {
            categoryOption.removeAt(i);
            return;
          }
          i++;
        });
      }
    }
  }

  /**
   * Function is used to select checkbox Placement option
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {Array} numbers array
   */
  onPlacementChange(e: Event) {
    const placementOption: FormArray = this.updateBannerForm.get('placement') as FormArray;
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
    this.bannerDispledSelected = [];
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
        this.updateBannerForm.patchValue({ image: this.fileToReturn });
        this.updateBannerForm.get('image').updateValueAndValidity();
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
