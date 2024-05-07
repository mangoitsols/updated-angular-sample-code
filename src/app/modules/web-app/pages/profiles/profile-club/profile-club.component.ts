import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClubDetail, LoginDetails, ThemeType } from '@core/models';
import { AuthService, LanguageService, ThemeService } from '@core/services';

@Component({
  selector: 'app-profile-club',
  templateUrl: './profile-club.component.html',
  styleUrls: ['./profile-club.component.css'],
})
export class ProfileClubComponent implements OnInit, OnDestroy {
  language: any;
  displayGeneral: boolean;
  displayPayment: boolean;
  displayMaster: boolean = true;
  displayClub: boolean;
  clubData: ClubDetail;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  userData: any;
  responseMessage: any;
  memberPhoto: any;
  thumbnail: any;
  userDetails: any;
  role: string;
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
    this.authService.setLoader(true);
    this.getClubData();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
  }

  getClubData() {
    if (sessionStorage.getItem('token')) {
      let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
      this.clubData = userData.Club;
      this.authService.setLoader(false);
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
