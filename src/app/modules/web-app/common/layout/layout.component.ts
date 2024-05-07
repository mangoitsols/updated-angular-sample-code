import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginDetails, ThemeType } from '@core/models';
import { AuthService, ThemeService, UserImageService } from '@core/services';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  userDetails: LoginDetails;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  private activatedPro: Subscription;
  constructor(public authService: AuthService, private cdref: ChangeDetectorRef, private router: Router, private themes: ThemeService, private userImageService: UserImageService) {
    this.activatedPro = this.themes.profile_imge.subscribe((resp: string) => {
      this.userImageService.emptyAuthorImage();
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
    if (!localStorage.getItem('token') || localStorage.getItem('token') == null) {
      window.location.reload();
    }
  }

  ngOnDestroy() {
    this.activatedSub.unsubscribe();
  }
}
