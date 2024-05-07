import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { NotificationService } from '@core/services';
import { LoginDetails } from '@core/models';
import { appSetting } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private notificationService: NotificationService, private router: Router, private _location: Location) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    var userDetails: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
    var userRole = userDetails.roles[0];
    let userInfo = appSetting.role[userRole];
    let returnValue: boolean = false;
    Object.entries(userInfo[route['data']['allow_permission'][0]]).forEach((res: any) => {
      if (res) {
        if (res[0].includes('_')) {
          res[0] = res[0].replace('_', '-');
        }

        if (state.url.includes(res[0])) {
          if (res[1] == 'No') {
            this.notificationService.showInfo("You don't have the access", 'Information');
            this.router.navigate([localStorage.getItem('previousUrl') ? localStorage.getItem('previousUrl') : './']);
            returnValue = false;
            return false;
          } else {
            returnValue = true;
            return true;
          }
        }
      }
    });
    return returnValue;
  }
}
