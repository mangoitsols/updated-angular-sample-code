import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginDetails, ProfileDetails, ThemeType } from '@core/models';
import { AuthService, LanguageService, ThemeService } from '@core/services';

@Component({
  selector: 'app-profile-my-club',
  templateUrl: './profile-my-club.component.html',
  styleUrls: ['./profile-my-club.component.css'],
})
export class ProfileMyClubComponent implements OnInit, OnDestroy {
  language: any;
  crntFunctions: boolean = false;
  private activatedSub: Subscription;
  displayGeneral: boolean;
  displayPayment: boolean;
  displayMaster: boolean;
  displayClub: boolean = true;
  setTheme: ThemeType;
  clubData: ProfileDetails;
  getclubInfo: ProfileDetails;
  userData: any;
  userDetails: any;
  role: string;
  responseMessage: any;
  memberPhoto: any;
  thumbnail: any;
  headline_word_option: number = 0;

  constructor(private authService: AuthService, private lang: LanguageService, private themes: ThemeService) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.getClubData();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
  }

  getClubData() {
    if (sessionStorage.getItem('token')) {
      let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-club-info/' + userData.database_id + '/' + userData.team_id, userData).subscribe((respData: any) => {
        this.getclubInfo = respData;
      });
      this.authService.memberSendRequest('get', 'profile-info/' + userData.database_id + '/' + userData.team_id + '/' + userData.member_id, userData).subscribe((respData: any) => {
        this.clubData = respData;
        this.authService.setLoader(false);
        if (this.clubData.currentFunctions) {
          this.crntFunctions = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
