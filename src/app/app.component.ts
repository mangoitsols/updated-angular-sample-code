import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ThemeService, UserImageService } from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'tineon';
  timeoutId: any;
  scrHeight: any;
  scrWidth: any;
  public isMobileResolution: boolean;
  language: string = 'de';
  private activatedPro: Subscription;

  constructor(private router: Router, private cdref: ChangeDetectorRef, private themes: ThemeService, private userImageService: UserImageService) {
    // this.checkTimeOut();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      localStorage.setItem('previousUrl', event.url);
    });

    this.activatedPro = this.themes.profile_imge.subscribe((resp: string) => {
      this.userImageService.emptyAuthorImage();
    });
  }

  ngOnInit(): void {
    sessionStorage.setItem('token', localStorage.getItem('token'));
    const bodyTag = document.body;
    bodyTag.classList.remove('mobile-red');
    bodyTag.classList.remove('mobile-green');
    bodyTag.classList.add(localStorage.getItem('mobileThemeOption'));
    this.language = localStorage.getItem('language');
    bodyTag.classList.add('lang-' + this.language);
  }

  @HostListener('window:keydown')
  @HostListener('window:keypress')
  @HostListener('window:mousedown')
  checkUserActivity() {
    // clearTimeout(this.timeoutId);
    // this.checkTimeOut();
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.detectViewChange();
  }

  private detectViewChange(): void {
    // Check the viewport width here and define the threshold for mobile view
    const isMobileView = window.innerWidth <= 768; // Adjust the threshold as needed
    let url = this.router.url.split('/')[2];
    if (!['mobile-themes', 'headline-wording'].includes(url)) {
      if (window.innerWidth <= 768 && this.router.url.includes('web')) {
        var currentUrl = this.router.url;
        currentUrl = currentUrl.replace('web', 'mobile');
        this.router.navigateByUrl(currentUrl);
      } else if (window.innerWidth > 768 && this.router.url.includes('mobile')) {
        var currentUrl = this.router.url;
        currentUrl = currentUrl.replace('mobile', 'web');
        this.router.navigateByUrl(currentUrl);
      }
    }
  }
}
