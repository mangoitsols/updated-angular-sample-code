import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url = this._router.url.split('/')[2];
    if (!['mobile-themes', 'headline-wording'].includes(url)) {
      if (window.innerWidth <= 768 && state.url.includes('web')) {
        var currentUrl = state.url;
        currentUrl = currentUrl.replace('web', 'mobile');
        this._router.navigateByUrl(currentUrl);
      } else if (window.innerWidth > 768 && state.url.includes('mobile')) {
        var currentUrl = state.url;
        currentUrl = currentUrl.replace('mobile', 'web');
        this._router.navigateByUrl(currentUrl);
      }
    }

    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let url = this._router.url;
        if (!['mobile-themes', 'headline-wording'].includes(url)) {
          if (window.innerWidth <= 768 && url.includes('web')) {
            var currentUrl = url;
            currentUrl = currentUrl.replace('web', 'mobile');
            this._router.navigateByUrl(currentUrl);
          } else if (window.innerWidth > 768 && url.includes('mobile')) {
            var currentUrl = url;
            currentUrl = currentUrl.replace('mobile', 'web');
            this._router.navigateByUrl(currentUrl);
          }
        }
      }
    });

    if (this._authService.IsLoggedIn()) {
      return true;
    } else {
      this._router.navigate(['/login']);
      return false;
    }
  }
}
