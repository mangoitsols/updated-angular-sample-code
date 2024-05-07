import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, NotificationService } from '@core/services';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    const authToken = this.auth.getToken();
    let language: string = localStorage.getItem('language');
    language = language ? language : 'de';

    let authReq = req.clone();
    if (req.url.includes('profile-photo') || req.url.includes('member-photo')) {
      authReq = req.clone({
        setHeaders: {
          authorization: authToken,
          accept: 'image/webp,*/*',
        },
      });
    } else {
      authReq = req.clone({
        setHeaders: {
          authorization: authToken,
          accept: 'application/json',
          lang: language,
        },
      });
    }

    return next.handle(authReq).pipe(
      map(this.handleData),
      catchError((error: any) => {
        if (error.name === 'TimeoutError') {
          this.auth.timeoutErrorFlag = true;
          setInterval(() => {
            this.auth.timeoutErrorFlag = false;
          }, 10000);
          return this.timeoutError();
        } else if (error.status === 401) {
          this.auth.clearStorageLogout();
        } else if (error.status === 403) {
          this.auth.clearStorageLogout();
          sessionStorage.clear();
          localStorage.clear();
          window.location.reload();
        } else if (error.status === 400) {
          this.auth.setLoader(false);
          if (typeof error?.error?.message === 'object') {
            this.notificationService.showError('Something went wrong!', 'Error');
          } else {
            this.notificationService.showError(error?.error?.message, 'Error');
          }
          return throwError(error);
        } else {
          const resData: any = error;
          if (resData['success']) {
            return resData;
          } else {
            this.auth.uncaughtError = true;
            return this.serverError();
          }
        }
        return throwError(error);
      })
    );
  }

  /* Data handler from HTTP service  */
  handleData: any = (response: Response) => {
    return response;
  };

  timeoutError() {
    return [
      {
        success: false,
        code: 500,
        message: 'I’m experiencing some difficulty due to connectivity issues. Please type your query again!',
      },
    ];
  }

  error400(error: any) {
    return [
      {
        success: false,
        code: error.status,
        message: error.error.message,
      },
    ];
  }

  serverError() {
    return [
      {
        success: false,
        code: 500,
        message: 'Something went wrong. Please try again after some time',
      },
    ];
  }
}
