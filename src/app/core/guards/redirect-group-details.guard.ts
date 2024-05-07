import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RedirectGroupDetailsGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const groupId = route.params.id;
    const currentURL = state.url;

    if (!groupId) {
      return false;
    }

    // If the current URL is /community/group/:groupId or /community/group/:groupId/ then redirect to /community/group/:groupId/details
    if (currentURL.endsWith(`community/group/${groupId}`) || currentURL.endsWith(`community/group/${groupId}/`)) {
      this.router.navigate([`web/community/group/${groupId}/details`]);
      return false;
    }

    return true;
  }
}
