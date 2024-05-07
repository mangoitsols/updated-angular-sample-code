import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoginDetails } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoursePermissionGuard implements CanActivate {
  userDetails: LoginDetails;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Get the course permission from local storage
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    const coursePermission = this.userDetails['coursePermisssion'][0]?.vcloud_isCourse;

    // Check if the course permission allows access
    if (coursePermission && coursePermission == 1) {
      return true;
    } else {
      // Redirect to a different route or show an unauthorized page
      if (window.innerWidth < 768) {
        //mobile
        this.router.navigate(['/mobile/dashboard']);
      } else {
        //desktop
        this.router.navigate(['/web/dashboard']);
      }

      return false;
    }
  }

  constructor(private router: Router) {}
}
