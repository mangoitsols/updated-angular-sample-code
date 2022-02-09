import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../service/language.service';
import { appSetting } from '../../app-settings';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-club-wall',
  templateUrl: './club-wall.component.html',
  styleUrls: ['./club-wall.component.css']
})
export class ClubWallComponent implements OnInit {
  language;
  userDetails;
  userAccess;
  createAccess;
  participateAccess;
  authorizationAccess;
  displayNews:boolean = false;
  displayDates:boolean = false;
  displayEvents:boolean = false;
  
  constructor(private lang : LanguageService, private router:Router) { 
    var getParamFromUrl = this.router.url.split("/")['2'];
    if(getParamFromUrl == 'club-events'){
      this.displayEvents = true;
    }else if(getParamFromUrl == 'club-dates'){
      this.displayDates = true;
    }else{
      this.displayNews = true;
    }
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;


  
    $('.nav')[0].childNodes.forEach(function (val, key) {
   
      
      if (val.classList.length) {
        val.classList.forEach(function (clName, index) {
          if(clName == "active" && val.childNodes[0].pathname != window.location.pathname){
        
            val.classList.remove("active");
            val.classList.remove("menu-active");
          }
        });
      }
    });
  }

  onNews(){
    this.displayNews = true;
    this.displayDates = false;
    this.displayEvents = false;
  }

  onDates(){
    this.displayNews = false;
    this.displayDates = true;
    this.displayEvents = false;
  }

  onEvents(){
    this.displayNews = false;
    this.displayDates = false;
    this.displayEvents = true;
  }

}
