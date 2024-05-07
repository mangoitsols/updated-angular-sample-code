import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService, UserImageService, CommonFunctionService } from '@core/services';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, map, startWith } from 'rxjs/operators';

@Pipe({
  name: 'memberPhoto',
})
export class MemberPhotoPipe implements PipeTransform {
  constructor(private authService: AuthService, private userImageService: UserImageService, private sanitizer: DomSanitizer, private commonFunctionService: CommonFunctionService) {}

  transform(memberId: number): Observable<string | SafeUrl> {
    const cachedImage = this.userImageService.getAuthorImage(memberId);
    if (cachedImage) {
      return of(cachedImage); // Return cached image if available
    } else {
      return this.authService.memberPhotoRequest('get', 'profile-photo/' + memberId, '').pipe(
        map((resppData: any) => {
          if (resppData) {
            const thumb = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(resppData)) as string;
            this.userImageService.setAuthorImage(memberId, thumb); // Cache the image
            return thumb;
          } else {
            return 'assets/img/defaultProfile.jpeg'; // Return default image if no response
          }
        }),
        catchError(() => {
          return of('assets/img/defaultProfile.jpeg'); // Handle error and return default image
        }),
        startWith('assets/img/defaultProfile.jpeg') // Emit default image URL initially
      );
    }
  }
}
