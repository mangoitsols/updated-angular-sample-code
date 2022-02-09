import { Injectable } from '@angular/core';
// import {map, catchError, timeout, takeUntil} from 'rxjs/operators';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
// import { Headers, Http, Response, HttpModule } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { baseUrl, memberUrl } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  uncaughtError: boolean = false;

  constructor(private http: HttpClient, private router: Router, private sanitizer: DomSanitizer) {
  }

  sendRequest(method: string, endPoint: string, data: any) {
    let response;
    let ls = localStorage.getItem('loggedIn');
    let experiesOn;
    let now = new Date().getTime();
    return this._actualSendRequest(method, endPoint, data);
  }

  memberSendRequest(method: string, endPoint: string, data: any) {
    let response;
    let ls = localStorage.getItem('loggedIn');
    let experiesOn;
    let now = new Date().getTime();
    return this._actualSendRequest(method, endPoint, data);
  }

  _actualSendRequest(method: string, endPoint: string, data: any) {
    let isOffile = this.showOffile;
    if (!isOffile) {
      /* Show golbal error cause by HTTP service */
      this.uncaughtError = false;
      setInterval(() => {
        this.uncaughtError = false;
      }, 5000);
      /* ------------------------------------ */


      const myHeaders = new HttpHeaders({

        'authorization': this.getToken(),
        'accept': 'application/json'
      });

      // const endPointUrl = environment.apiEndPoint + endPoint;
      let endPointUrl: any;

      endPointUrl = `${baseUrl}` + endPoint + ``;
      if (method == 'post') {
        return this.http.post(endPointUrl,
          data,
          { headers: myHeaders }).pipe(
            map(this.handleData),
            catchError(this.handleError));
      } else if (method == 'put') {
        return this.http.put(endPointUrl,
          data,
          { headers: myHeaders }).pipe(
            map(this.handleData),
            catchError(this.handleError));
      } else if (method == 'delete') {
        return this.http.delete(endPointUrl,
          { headers: myHeaders }).pipe(
            map(this.handleData),
            catchError(this.handleError));
      } else {
        return this.http.get(endPointUrl,
          { headers: myHeaders }).pipe(
            map(this.handleData),
            catchError(this.handleError));
      }
    }
  }

  /* Error handler from HTTP service  */
  private handleError = (error) => {
    console.log(error)
    if (error.name == 'TimeoutError') {
      this.timeoutErrorFlag = true;
      setInterval(() => {
        this.timeoutErrorFlag = false;
      }, 10000);
      return this.timeoutError();
    }
    else if (error.status == 401) {
      this.clearStorageLogout();
    }
    else if (error.status == 400) {
      return this.error400(error);
    }
    else {
      // const resData = error.json();
      const resData = error;
      if (resData['success']) {
        return resData;
      }
      else {
        this.uncaughtError = true;
        return this.serverError();
      }
    }
  }
  /* Data handler from HTTP service  */
  private handleData = (response: Response) => {
    // const resData = response.json();
    const resData = response;
    return resData;
  }

  private timeoutError() {
    return [{
      "success": false,
      "code": 500,
      "message": "I’m experiencing some difficulty due to connectivity issues. Please type your query again!"
    }]
  }

  private error400(error) {
    return [{
      "success": false,
      "code": error.status,
      "message": error.error.message
    }]
  }

  private serverError() {
    return [{
      "success": false,
      "code": 500,
      "message": "Something went wrong. Please try again after some time"
    }]
  }

  clearStorageLogout() {
    localStorage.clear();
    // this.deleteAllCookies();
    // this.router.navigate(['/signin']);
  }

  loader: Boolean = false;
  setLoader(value: Boolean) {
    this.loader = value;
  }
  get showLoader() {
    return this.loader;
  }

  timeoutErrorFlag: Boolean = false;
  setTimeoutErrorFlag(value: Boolean) {
    this.timeoutErrorFlag = value;
  }
  get getTimeoutErrorFlag() {
    return this.timeoutErrorFlag;
  }

  get showOffile() {
    return !navigator.onLine;
  }

  reloadRequest(method, endPoint, data) {
    return this._actualSendRequest(method, endPoint, data);
  }

  IsLoggedIn() {
    //it returns a boolean value, if the token exsist then true else vice versa
    return !!localStorage.getItem('token');
  }

  getToken() {
    let session = 'Bearer ' + localStorage.getItem('token');

    return session;
  }

}
