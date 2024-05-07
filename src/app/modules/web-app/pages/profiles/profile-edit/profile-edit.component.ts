import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Subscription } from 'rxjs';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ProfileDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';

declare var $: any;

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
  providers: [DatePipe],
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  language: any;
  registrationForm: UntypedFormGroup;
  datePipeString: string;
  displayGeneral: boolean = true;
  displayPayment: boolean;
  displayMaster: boolean;
  displayClub: boolean;
  submitted: boolean = false;
  file: File;
  fileToReturn: File;
  responseMessage: string = null;
  thumbnail: SafeUrl;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  memberPhoto: SafeUrl;
  role: string;
  userData: ProfileDetails;
  memberPhotosuccess: string;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  private activatedPro: Subscription;
  @ViewChild('fileInput') fileInput: ElementRef;
  userDataProfile: any;
  isImage: boolean = false;
  allowAdvertisment: any;
  imgHeight: any;
  imgWidth: any;
  headline_word_option: number = 0;
  otherInfo: any;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private _router: Router,
    private lang: LanguageService,
    private sanitizer: DomSanitizer,
    private themes: ThemeService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.activatedPro = this.themes.profile_imge.subscribe((resp: string) => {
      this.getUserImage();
    });
    this.userDataProfile = JSON.parse(localStorage.getItem('user-data'));
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));

    this.allowAdvertisment = localStorage.getItem('allowAdvertis');
    this.language = this.lang.getLanguageFile();
    this.shareBirthdayData();
    this.getProfileData();
    this.getUserImage();
    this.registrationForm = this.formBuilder.group({
      street: ['', Validators.required],
      street2: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      countryCode: [''],
      postCode: ['', Validators.required],
      poboxCity: [''],
      email: [''],
      phone: ['', [Validators.required, Validators.pattern('^[0-9-+()_{}]*$')]],
      share: [''],
      birthDate: ['', Validators.required],
      allowAdvertis: [''],
    });
  }

  /**
   * Function is used to get member photo
   * @author  MangoIt Solutions
   * @param   {}
   * @return  mebmber phto in blob formate
   */
  getUserImage() {
    if (sessionStorage.getItem('token')) {
      this.authService.memberPhotoRequest('get', 'profile-photo/' + this.userDataProfile.member_id, null).subscribe(
        (resppData: any) => {
          this.thumbnail = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(resppData)) as string;
          this.memberPhoto = this.thumbnail;
        },
        (error: any) => {
          this.memberPhoto = null;
        }
      );
    }
  }

  /**
   * Function is used to get member information
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {array} member information detsails
   */
  getProfileData() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'member-info/' + this.userDataProfile.database_id + '/' + this.userDataProfile.team_id + '/' + this.userDataProfile.member_id, this.userDataProfile).subscribe((respData: any) => {
        this.authService.setLoader(false);
        // if (Object.keys(respData).length) {
        this.userData = respData;
        this.role = this.userDataProfile.roles[0];
        this.setValue();
        // }
      });
    }
  }

  /**
   * Function is used to get member information
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {array} member information detsails
   */
  shareBirthdayData() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'shareBirthdayData', '').subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.otherInfo = respData;
      });
    }
  }

  /**
   * Function is used to set value in the edit form
   * @author  MangoIt Solutions(M)
   */
  setValue() {
    let share_birthday = this.otherInfo.share_birthday == 1 ? 0 : 1;
    if (this.userData.changeRequest.member.status == 'pending') {
      this.registrationForm = this.formBuilder.group({
        street: [this.userData.changeRequest.member.dataChanges.street, [Validators.required, this.noWhitespace]],
        street2: [this.userData.street2, [this.noWhitespace]],
        city: [this.userData.changeRequest.member.dataChanges.city, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        countryCode: [this.userData.countryCode ? this.userData.countryCode : 'DE'],
        postCode: [this.userData.changeRequest.member.dataChanges.postCode, [Validators.required, Validators.pattern('^[1-9]{1}?[0-9]*$')]],
        poboxCity: [this.userData.poboxCity],
        email: [this.userData.email],
        phone: [this.userData.changeRequest.member.dataChanges.phone, [Validators.required, Validators.pattern('^[0-9-+()_{}]*$')]],
        birthDate: [this.datePipe.transform(this.userData.changeRequest.member.dataChanges.birthDate, 'yyyy-MM-dd'), [Validators.required]],
        share: [share_birthday],
        allowAdvertis: [''],
      });

      if (this.allowAdvertisment == 0) {
        this.registrationForm.controls.allowAdvertis.setValue(this.allowAdvertisment);
      }
    } else {
      if (this.userData.birthDate) {
        this.datePipeString = this.datePipe.transform(this.userData.birthDate, 'yyyy-MM-dd');
      }
      this.registrationForm = this.formBuilder.group({
        street: [this.userData.street, [Validators.required, this.noWhitespace]],
        street2: [this.userData.street2, [this.noWhitespace]],
        city: [this.userData.city, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        countryCode: [this.userData.countryCode ? this.userData.countryCode : 'DE'],
        postCode: [this.userData.postCode, [Validators.required, Validators.pattern('^[1-9]{1}?[0-9]*$')]],
        poboxCity: [this.userData.poboxCity],
        email: [this.userData.email],
        phone: [this.userData.phone, [Validators.required, Validators.pattern('^[0-9-+()_{}]*$')]],
        birthDate: [this.datePipeString, [Validators.required]],
        share: [share_birthday],
        allowAdvertis: [''],
      });
      if (this.allowAdvertisment == 0) {
        this.registrationForm.controls.allowAdvertis.setValue(this.allowAdvertisment);
      }
    }
  }

  noWhitespace(control: UntypedFormControl) {
    if (control?.value != null) {
      if (control?.value.length != 0) {
        let isWhitespace: boolean = (control.value || '').trim().length === 0;
        let isValid: boolean = !isWhitespace;
        return isValid ? null : { whitespace: true };
      } else {
        let isValid: boolean = true;
        return isValid ? null : { whitespace: true };
      }
    } else {
      let isValid: boolean = true;
      return isValid ? null : { whitespace: true };
    }
  }

  /**
   * Function is used to update user personal information
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {string} success message
   */
  registrationProcess() {
    this.submitted = true;

    if (this.registrationForm.value['allowAdvertis'] == true) {
      this.registrationForm.value['allowAdvertis'] = 0;
    } else {
      this.registrationForm.value['allowAdvertis'] = 1;
    }
    if (sessionStorage.getItem('token') && this.registrationForm.valid) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'modify-user-data/' + this.userDataProfile.database_id + '/' + this.userDataProfile.team_id + '/' + this.userDataProfile.member_id, this.registrationForm.value).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.successMessage(respData);
        this.submitted = false;
        if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  successMessage(msg: string) {
    if (msg == 'OK') {
      localStorage.removeItem('allowAdvertis');
      localStorage.setItem('allowAdvertis', this.registrationForm.value['allowAdvertis']);
      this.notificationService.showSuccess(this.language.profile_bank.success_msg, 'Success');
      this.registrationForm.reset();

      setTimeout(() => {
        this._router.navigate(['/web/profile']);
      }, 2000);
      return true;
    }
  }

  /**
   * Function is used to changed user profile Image
   * M-Date: 03 Feb 2023
   * @author  MangoIt Solutions (T)
   * @param   {}
   * @return  {object} user details
   */
  changeImage() {
    if (this.croppedImage) {
      let data = {
        image_file: this.croppedImage.split('base64,')[1],
      };
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'change-profile-picture/', data).subscribe((respData: any) => {
        this.memberPhotosuccess = respData;
        this.authService.setLoader(false);
        if (this.memberPhotosuccess == 'OK') {
          this.themes.getProfilePicture(this.memberPhotosuccess);
          this.notificationService.showSuccess(this.language.profile.upload_profile, 'Success');
          setTimeout(() => {
            this._router.navigate(['/web/profile']);
          }, 3000);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(this.language.community_messages.code_error, 'Error');
        }
      });
    }
  }

  cancel() {
    this._router.navigate(['/web/profile']);
  }

  /**
   * Function is used to print page
   * @author  MangoIt Solutions
   */
  print() {
    window.print();
  }

  /**
   * Function is used to get date
   * @author  MangoIt Solutions
   */
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  onGeneralInfo() {
    this.displayGeneral = true;
    this.displayPayment = false;
    this.displayMaster = false;
    this.displayClub = false;
  }

  onPaymentData() {
    this.displayGeneral = false;
    this.displayPayment = true;
    this.displayMaster = false;
    this.displayClub = false;
  }

  onMasterData() {
    this.displayGeneral = false;
    this.displayPayment = false;
    this.displayMaster = true;
    this.displayClub = false;
  }
  onClubData() {
    this.displayGeneral = false;
    this.displayPayment = false;
    this.displayMaster = false;
    this.displayClub = true;
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
   * Function is used to cropped the uploaded image
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  imageCropped(event: ImageCroppedEvent) {
    this.errorImage = { isError: false, errorMessage: '' };
    let imgData = this.commonFunctionService.getAspectRatio(this.imgHeight, this.imgWidth);
    // this.croppedImage = event.base64;
    this.imageCompress
      .compressFile(event.base64, -1, 50, 50, imgData[0], imgData[1]) // 50% ratio, 50% quality
      .then(compressedImage => {
        this.croppedImage = compressedImage;
        this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
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

  reloadCurrentRoute() {
    let currentUrl = '/web/profile';
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }

  openBirthdayConfirmation(event: any) {
    let message = event.target.checked == true ? this.language.profile.allow_share_birthday : this.language.profile.not_allow_share_birthday;
    this.confirmDialogService.confirmThis(
      message,
      () => {
        this.shareBirthday(event.target.checked);
      },
      () => {
        let status = event.target.checked == true ? false : true;
        this.registrationForm.get('share').setValue(status);
      }
    );
  }

  shareBirthday(showSuccessMessage: any) {
    let body = {
      shareBirthday: this.registrationForm.value['share'] == true ? 0 : 1,
    };

    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'share-birthday', body).subscribe((respData: any) => {
        this.authService.setLoader(false);
        localStorage.setItem('shareBirthday', this.registrationForm.value['share']);
        if (showSuccessMessage) {
          this.notificationService.showSuccess(respData?.result?.message, 'Success');
        }

        this.submitted = false;
        if (respData['code'] == 400) {
          this.notificationService.showError(respData?.result?.message, 'Error');
        }
      });
    }
  }

  openAdvertisementConfirmation(event: any) {
    let message = event.target.checked == true ? this.language.profile.allow_advertisement : this.language.profile.not_allow_advertisement;
    this.confirmDialogService.confirmThis(
      message,
      () => {
        this.allowAdvertis(event.target.checked);
      },
      () => {
        let status = event.target.checked == true ? false : true;
        this.registrationForm.get('allowAdvertis').setValue(status);
      }
    );
  }

  allowAdvertis(showSuccessMessage: any) {
    let body = {
      allowAdvertis: this.registrationForm.value['allowAdvertis'] == true ? 0 : 1,
    };
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'allow-advertisment', body).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (this.registrationForm.value['allowAdvertis'] == true) {
          localStorage.setItem('allowAdvertis', '0');
          this.allowAdvertisment = 0;
        } else {
          localStorage.setItem('allowAdvertis', '1');
          this.allowAdvertisment = 1;
        }
        if (showSuccessMessage) {
          this.notificationService.showSuccess(respData?.result?.message, 'Success');
        }

        this.submitted = false;
        if (respData['code'] == 400) {
          this.notificationService.showError(respData?.result?.message, 'Error');
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.activatedPro.unsubscribe();
  }
}
