import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';
import { LanguageService } from '../../service/language.service';
import { appSetting } from '../../app-settings';
declare var $: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  language;
  userDetails;
  userAccess;
  createAccess;
  participateAccess;
  authorizationAccess;
  isActive = "dashboard";
  clubData;

  constructor(
    private authService: AuthServiceService,
    private _router: Router,
    private lang: LanguageService
  ) { }
public ngInit(){
  $(document).ready(function () {
    console.log ('Pratik');
    $(".sidebar-wrapper").hover(
      
      function () {
        $(this).addClass("sidebar-hover");
      },
      function () {
        $(this).removeClass("sidebar-hover");
      }
    );
  });
}



  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data')); 
    let userRole = this.userDetails.roles[0];
    
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;
    
    this.getClubData();
  }

  // showCollapse: boolean = false;
  // onShow() {
  //   let el = document.getElementsByClassName("mat-typography");
  //   if (!this.showCollapse) {
  //     this.showCollapse = true;
  //     el[0].className = "mat-typography collapse-in";
  //   }
  //   else {
  //     this.showCollapse = false;
  //     el[0].className = "mat-typography";
  //   }
  // }
  
  getClubData() {
    if (sessionStorage.getItem('token')) {
      let userData = JSON.parse(localStorage.getItem('user-data'));
      this.clubData = userData.Club;
    }
  }

}
