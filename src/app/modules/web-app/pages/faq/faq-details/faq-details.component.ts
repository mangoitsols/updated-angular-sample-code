import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { saveAs } from 'file-saver';
import { ClubDetail, FAQ, FAQCategory, LoginDetails, ProfileDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, AcceptdenyService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-faq-details',
  templateUrl: './faq-details.component.html',
  styleUrls: ['./faq-details.component.css'],
})
export class FaqDetailsComponent implements OnInit, OnDestroy {
  language: any;
  FAQForm: UntypedFormGroup;
  userDetails: LoginDetails;
  updateFaqsData: any;
  displayError: boolean = false;
  getclubInfo: ClubDetail;
  thumbnail: string;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  faqsData: any;
  responseMessage: string = null;
  FAQSubmit: boolean = false;
  docErrorMsg: boolean = false;
  hasPicture: boolean = false;
  hasDoc: boolean = false;
  selectPos: boolean = false;
  deletePos: boolean = false;
  tenCategoryFAQ: boolean = false;
  allCategoryFAQ: boolean = false;
  showButton: boolean = false;
  displayFaq: boolean = true;
  displayFaqCategory: boolean;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  file: File;
  fileToReturn: File;
  imgName: string;
  positionDeSelectedItem: number;
  categorySelectedItem: number;
  positionSelectedItem: number;
  categoryDropdownSettings: IDropdownSettings;
  positionDropdownSettings: IDropdownSettings;
  userRole: string;
  imageUrl: string;
  teamId: number;
  showFile: string;
  faqId: number;
  editId: number;
  catListArray: { id: number; name: string }[] = [];
  positionList: { id: number; name: number }[] = [];
  positionn: { id: number; name: number }[] = [];
  categoryShow: { id: number; name: string }[] = [];
  categoryData: FAQCategory[] = [];
  faqDataById: FAQ;
  faqDataByCat: FAQ[] = [];
  searchData: FAQ[] = [];
  categoryAllFaq: FAQ[];
  approved_status: number;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  allUser: any[] = [];
  alluserInformation: { member_id: number }[] = [];
  position: { id: number; name: number }[] = [];
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
  faq_image: string = '';
  faq_document: string = '';
  result: any;
  documentData: any;
  dowloading: boolean = false;
  faq_id: any;
  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private themes: ThemeService,
    private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService,
    private updateConfirmDialogService: UpdateConfirmDialogService,
    private denyReasonService: DenyReasonConfirmDialogService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
    private acceptdenyService: AcceptdenyService
  ) {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.faq_id = this.route.snapshot.params.faqId;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe((event: NavigationEnd) => {
        this.faq_id = this.route.snapshot.params.faqId;
        this.getCategoryName();
      });

    this.refreshPage = this.confirmDialogService.dialogResponse.subscribe(message => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });
    this.denyRefreshPage = this.updateConfirmDialogService.denyDialogResponse.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });
    this.removeUpdate = this.denyReasonService.remove_deny_update.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });
  }

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

    this.getFAaqDetails(this.faq_id);
    this.getCategoryName();
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
      approved_status: [this.approved_status],
    });
  }

  getFAaqDetails(faqId: number) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'getFaqbyId/' + faqId, null).subscribe((respData: any) => {
        if (respData['isError'] == false) {
          this.faqsData = null;
          this.faqsData = respData?.result[0];
          this.updateFaqsData = JSON.parse(respData?.result[0]?.updated_record);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
        this.authService.setLoader(false);
      });
    }
  }

  getCategoryName() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'category', null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.categoryData = respData;
      if (respData && respData.length > 0) {
        Object(respData).forEach((key: FAQCategory, value: number) => {
          if (value == 0) {
            this.getFaqByCategory(key.id);
          }
          this.catListArray.push({ id: key.id, name: key.category_title });
        });
      }
    });
  }

  getFaqByCategory(id: number) {
    this.faqId = id;
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getFaqbyCategory/' + id + '/0/', null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.tenCategoryFAQ = true;
      this.allCategoryFAQ = false;
      this.faqDataByCat = respData;
      if (this.faqDataByCat && this.faqDataByCat.length == 10) {
        this.showButton = true;
      } else {
        this.showButton = false;
      }
    });
  }

  editFAQById(id: number) {
    this.getFaqByCategory(this.faqId);

    this.hasPicture = false;
    this.hasDoc = false;
    this.authService.setLoader(true);
    this.faqDataById = null;
    this.authService.memberSendRequest('get', 'getFaqbyId/' + id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData && respData.result && respData.result.length > 0) {
        this.faqDataById = respData.result[0];
        this.editId = this.faqDataById.id;
      }
      this.setEditFaqData();
    });
  }

  setEditFaqData() {
    this.authService.setLoader(true);
    this.positionn = [];
    if (this.faqDataById.position) {
      if (this.positionList && this.positionList.length > 0) {
        this.positionList.forEach((val, key) => {
          if (val.id == this.faqDataById.position) {
            this.positionn.push({ id: val.id, name: val.name });
            this.FAQForm.controls['position'].setValue(this.positionn);
          }
        });
      }
    } else {
      this.FAQForm.controls['position'].setValue(this.positionn);
    }
    if (this.catListArray && this.catListArray.length > 0) {
      this.catListArray.forEach((val, key) => {
        if (val.id == this.faqDataById.category) {
          this.categoryShow = [];
          this.categoryShow.push({ id: val.id, name: val.name });
          this.FAQForm.controls['category'].setValue(this.categoryShow);
        }
      });
    }

    this.FAQForm.controls['title'].setValue(this.faqDataById.title);
    this.FAQForm.controls['description'].setValue(this.faqDataById.description);
    this.FAQForm.controls['image'].setValue(this.faqDataById.image);
    this.FAQForm.controls['approved_status'].setValue(this.faqDataById.approved_status);
    this.showFile = this.faqDataById.image;
    this.hasDoc = true;
    this.hasPicture = false;
    this.imageUrl = '';

    if (this.faqDataById?.image && this.faqDataById?.image != '') {
      let tokenUrl = this.commonFunctionService.genrateImageToken(this.faqDataById?.id, 'faq');
      this.faqDataById['token'] = { url: tokenUrl, isLoading: true, imageLoaded: false };
      this.commonFunctionService.loadImage(this.faqDataById['token']);
      this.hasDoc = false;
      this.hasPicture = true;
      this.imageUrl = tokenUrl;
    }

    if (this.faqDataById?.document && this.faqDataById?.document != '') {
      this.hasPicture = false;
      this.hasDoc = true;
      this.faq_document = this.faqDataById?.document;
    }

    $('#exModal').modal('show');
    $('#editFaq').click();
    this.authService.setLoader(false);
  }

  editFAQ() {
    this.FAQSubmit = true;
    if (this.categorySelectedItem) {
      this.FAQForm.controls['category'].setValue(this.categorySelectedItem);
    } else if (this.faqDataById.category) {
      if (this.categoryShow && this.categoryShow.length > 0) {
        this.categoryShow.forEach((val, key) => {
          let categoryShow = val.id;
          this.FAQForm.controls['category'].setValue(categoryShow);
        });
      }
    }
    this.FAQForm.value['team_id'] = this.userDetails.team_id;
    var formData: any = new FormData();
    this.authService.setLoader(false);
    for (const key in this.FAQForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.FAQForm.value, key)) {
        const element: any = this.FAQForm.value[key];
        if (key == 'title') {
          formData.append('title', element);
        }
        if (key == 'category') {
          formData.append('category', element);
        }
        if (key == 'position') {
          if (this.positionSelectedItem && this.selectPos == true) {
            formData.append('position', this.positionSelectedItem);
          } else if (this.positionDeSelectedItem && this.deletePos == true) {
            this.positionSelectedItem = null;
            formData.append('position', this.positionSelectedItem);
            this.positionDeSelectedItem = null;
          } else if (this.faqDataById.position) {
            formData.append('position', this.positionn[0].id);
          } else if (this.faqDataById.position == null) {
            formData.append('position', '');
          }
        }
        if (key == 'description') {
          formData.append('description', element);
        }

        if (key == 'approved_status') {
          formData.append('approved_status', element);
        }

        if (key == 'image') {
          if (this.fileToReturn) {
            formData.append('file', this.fileToReturn);
          } else {
            if (this.faq_image) {
              formData.append('faq_image', this.faq_image);
            } else {
              formData.append('faq_image', '');
            }
            if (this.faq_document) {
              formData.append('faq_document', this.faq_document);
            } else {
              formData.append('faq_document', '');
            }
          }
        }
        if (key == 'team_id') {
          formData.append('team_id', element);
        }
      }
    }
    if (this.FAQForm.valid) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('put', 'updateFaq/' + this.editId, formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          this.getFaqByCategory(this.faqId);
          setTimeout(() => {
            $('#exModal').modal('hide');
            // this.ngOnInit();
            this.getFAaqDetails(this.faq_id);
          }, 2000);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');

          if (this.categorySelectedItem || this.faqDataById.category) {
            var faq_cat: any;
            if (this.categorySelectedItem) {
              faq_cat = this.categorySelectedItem;
            } else if (this.faqDataById.category) {
              faq_cat = this.faqDataById.category;
            }
            if (this.catListArray?.length > 0) {
              this.catListArray.forEach((val, key) => {
                if (val.id == faq_cat) {
                  this.categoryShow = [];
                  this.categoryShow.push({ id: val.id, name: val.name });
                  this.FAQForm.controls['category'].setValue(this.categoryShow);
                }
              });
            }
          }
        }
      });
    }
  }

  showToggle: boolean = false;
  onShow() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('bunch_drop');
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = 'bunch_drop show';
    } else {
      this.showToggle = false;
      el[0].className = 'bunch_drop';
    }
  }

  removeHtml(str) {
    var tmp: HTMLElement = document.createElement('DIV');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
  }

  goBack() {
    this.router.navigate(['/web/vereins-faq']);
  }

  deleteFaqs(faqsId: number) {
    this.acceptdenyService.deleteFaqs(faqsId, 'web');
  }

  deleteUpdateFaqs(faqsId: number) {
    this.acceptdenyService.deleteUpdateFaqs(faqsId, 'web');
  }

  approveFaqs(faqsId: number) {
    this.acceptdenyService.approvedFaqs(faqsId, 'web');
  }

  approveUpdteFaqs(faqsId: number) {
    this.acceptdenyService.approvedUpdateFaqs(faqsId, 'web');
  }

  denyFaqs(faqsId: number) {
    this.acceptdenyService.denyFaqs(faqsId, 'web');
  }

  onFaq() {
    this.displayFaq = true;
    this.displayFaqCategory = false;
  }
  onFaqCategory() {
    this.displayFaqCategory = true;
    this.displayFaq = false;
  }

  onCategoryItemSelect(item: { id: number; name: string }) {
    this.categorySelectedItem = item.id;
  }

  onCategoryItemDeSelect(item: { id: number; name: string }) {
    this.categorySelectedItem = null;
    this.categoryShow = [];
    this.FAQForm.value.category = '';
  }

  onPositionItemSelect(item: { id: number; name: number }) {
    this.positionSelectedItem = item.id;
    this.selectPos = true;
    this.deletePos = false;
  }

  onPositionItemDeSelect(item: { id: number; name: number }) {
    this.positionDeSelectedItem = item.id;
    this.selectPos = false;
    this.deletePos = true;
  }

  /**
   * Function is used to validate file type is image and upload images
   * @author  MangoIt Solutions
   * @param   {}
   * @return  error message if file type is not image
   */
  errorFile: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  uploadFile(event: Event) {
    var file: File = (event.target as HTMLInputElement).files[0];

    const mimeType: string = file.type;
    const mimeSize: number = file.size;
    this.imgName = file.name;
    if (mimeType.match(/image\/*/) != null || mimeType.match(/application\/*/) != null || mimeType.match(/text\/*/) != null) {
      if (mimeType.match(/application\/*/) || mimeType.match(/text\/*/)) {
        if (mimeSize > 20000000) {
          this.docErrorMsg = true;
          this.errorFile = { isError: true, errorMessage: this.language.create_message.file_size };
        } else {
          this.fileToReturn = null;
          this.errorFile = { isError: false, errorMessage: '' };
          this.docErrorMsg = false;
          this.fileToReturn = file;
          this.FAQForm.patchValue({
            image: this.fileToReturn,
          });
          this.FAQForm.get('image').updateValueAndValidity();

          this.fileToReturn = file;
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
  }

  errorImage: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  fileChangeEvent(event: Event): void {
    if (event && event.type == 'change') {
      this.croppedImage = '';
      this.imageChangedEvent = null;
      $('.preview_txt').hide();
      $('.preview_txt').text('');
      this.isImage = true;
    }
    $('#imageCrope').show();
    this.fileToReturn = null;
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

  imageLoaded() {}

  cropperReady() {
    /* cropper ready */
    this.isImage = false;
  }

  loadImageFailed() {
    /* show message */
  }

  /**
   * Function is used to download document
   * @author  MangoIt Solutions
   * @param   {path}
   */
  downloadDoc(path: any, id: any, type: any) {
    let data = {
      name: path,
      faq_id: id,
      type: type,
    };
    this.dowloading = true;
    var endPoint = 'download-faqs-document';
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
            this.authService.sendRequest('post', 'delete-faqs-document/uploads', data).subscribe((result: any) => {
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

  downloadImage(id: any) {
    let tokenUrl = this.commonFunctionService.genrateImageToken(id, 'faq');
    window.open(tokenUrl, '_blank');
  }

  downloadUpdateImage(id: any) {
    let tokenUrl = this.commonFunctionService.genrateImageToken(id, 'updateFaq');
    window.open(tokenUrl, '_blank');
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Club Tools', link: ' ' }, { label: this.language.create_faq.faqDetail }];
  }

  ngOnDestroy(): void {
    this.refreshPage.unsubscribe();
    this.activatedSub.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
  }
}
