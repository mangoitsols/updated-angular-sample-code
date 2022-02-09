import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';
import { LanguageService } from '../../service/language.service';

import { CookieService } from 'ngx-cookie-service';
declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  language;
  loginsubmitted:boolean = false;
  validError:boolean = false;
  formError:any = [];
  displayFlag = 'de';
  loginForm: FormGroup;

  constructor(
    public authService: AuthServiceService, 
    private router: Router,
    private lang : LanguageService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.loginForm = new FormGroup({
      username : new FormControl('', [Validators.required]),
      password : new FormControl('', [Validators.required]),
      remember: new FormControl('')
    });
    
    if(this.cookieService.get('username') != null && this.cookieService.get('password') != null){
      this.loginForm.controls["username"].setValue(this.cookieService.get('username'));
      this.loginForm.controls["password"].setValue(this.cookieService.get('password'));
    }
    
    if(!localStorage.getItem('language')){
      localStorage.setItem('language','de');
    }
    this.displayFlag = localStorage.getItem('language');

    if (this.cookieService.get('remember')) { 
      let self = this;
      setTimeout(function () {
        $(".rememberMe").trigger('click');
        $(".username").val(self.cookieService.get('username'));
        $(".password").val(self.cookieService.get('password'));
      }, 300);
    }

  }
  


  loginProcess(){   
    this.formError = [];
    this.loginsubmitted = true;
    this.validError = false;
    if (this.loginForm.valid) {

      if (this.loginForm.controls['remember'].value) {
        this.cookieService.set('username', this.loginForm.controls['username'].value);
        this.cookieService.set('password', this.loginForm.controls['password'].value);
        this.cookieService.set('remember', "rememberme");
      }

      this.authService.setLoader(true);
      this.authService.sendRequest('post', 'login-keycloak', this.loginForm.value)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            this.loginsubmitted = false;
            this.validError = false;
            this.authService.setLoader(false);

            
            if(respData['access_token']){
              const url: string[] = ["/dashboard"];
              this.router.navigate(url);
              sessionStorage.setItem('token',respData['access_token']);
              localStorage.setItem('token',respData['access_token']);
              localStorage.setItem('user-id',respData['userId']);
              localStorage.setItem('user-data',JSON.stringify(respData));
            }
            else if(respData['code'] == 400){
              this.validError = true;
              this.formError = respData['message'];
            }
          }
        );
    }
  }
  showToggle:boolean = false;
  onShow(){
    let el = document.getElementsByClassName("lang-drop");
    if(!this.showToggle){
      this.showToggle = true;
      el[0].className = "dropdown lang-drop show";
    }
    else{
      this.showToggle = false;
      el[0].className = "dropdown lang-drop";
    }
  }

  onLanguageSelect(lan:any){
    localStorage.setItem('language',lan);
    window.location.reload();
  }

}