import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { LoginDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  language: any;
  responseMessage: string;
  memberPhoto: any;
  submitted: boolean = false;
  c_password: boolean = false;
  displayGeneral: boolean = true;
  displayPayment: boolean;
  displayMaster: boolean;
  displayClub: boolean;
  changePasswordForm: UntypedFormGroup;
  setTheme: ThemeType;
  role: string = '';
  userDetails: any;
  private activatedSub: Subscription;
  private activatedPro: Subscription;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: false,
  };
  userData: any;
  userDataProfile: any;
  allowAdvertisment: any;
  headline_word_option: number = 0;
  checkStatus: any;

  constructor(private authService: AuthService, public formBuilder: UntypedFormBuilder, private _router: Router, private lang: LanguageService, private themes: ThemeService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.activatedPro = this.themes.profile_imge.subscribe(resp => {
      let pro = resp;
    });

    this.userDataProfile = JSON.parse(localStorage.getItem('user-data'));
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));

    this.allowAdvertisment = localStorage.getItem('allowAdvertis');
    this.language = this.lang.getLanguageFile();
    this.getProfileData();

    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', Validators.compose([Validators.minLength(5), Validators.required, Validators.pattern('^[a-zA-Z0-9/!/#/$/%/^/&/*/(/)/_/-/+/=/@]*$')])],
      newPassword: ['', Validators.compose([Validators.minLength(5), Validators.required, Validators.pattern('^[a-zA-Z0-9/!/#/$/%/^/&/*/(/)/_/-/+/=/@]*$')])],
      confirmPassword: ['', Validators.compose([Validators.minLength(5), Validators.required, Validators.pattern('^[a-zA-Z0-9/!/#/$/%/^/&/*/(/)/_/-/+/=/@]*$')])],
    });
    this.userData = JSON.parse(localStorage.getItem('user-data'));
  }

  getProfileData() {
    if (sessionStorage.getItem('token')) {
      let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'member-info/' + userData.database_id + '/' + userData.team_id + '/' + userData.member_id, userData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.userDetails = respData;

        if (respData.changeRequest.member.status === 'pending') {
          this.checkStatus = respData.changeRequest.member;
          this.userDetails = respData.changeRequest.member.dataChanges;
          // this.allowAdvertisment = this.userDetails.allowAdvertis;
        } else {
          this.userDetails = respData;
        }
        this.role = userData.roles[0];
      });
    }
  }

  inEdit() {
    this._router.navigate(['/web/edit-profile']);
  }

  print() {
    window.print();
  }

  checkPassword() {
    var password: string = this.changePasswordForm.get('newPassword').value;
    var confirm_password: string = this.changePasswordForm.get('confirmPassword').value;
    if (password == confirm_password) {
      this.c_password = false;
    } else {
      this.c_password = true;
    }
  }

  closeModal() {
    this.changePasswordForm.reset();
    this.c_password = false;
  }

  changePassword() {
    this.checkPassword();
    this.submitted = true;
    if (sessionStorage.getItem('token') && this.changePasswordForm.valid && this.c_password == false) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'change-password', this.changePasswordForm.value).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          this.notificationService.showSuccess(respData['result'], 'Success');
          setTimeout(() => {
            $('.btn-close').trigger('click');
            sessionStorage.clear();
            this._router.navigate(['/login']);
          }, 3000);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
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

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.activatedPro.unsubscribe();
  }
}
