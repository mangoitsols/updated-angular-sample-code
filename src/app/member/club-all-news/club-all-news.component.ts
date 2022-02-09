import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';
import { LanguageService } from '../../service/language.service';
declare var $: any;

@Component({
    selector: 'app-club-all-news',
    templateUrl: './club-all-news.component.html',
    styleUrls: ['./club-all-news.component.css']
})
export class ClubAllNewsComponent implements OnInit {
    language;
    userData;
    role = '';
    dashboardData;
    responseMessage = null;
    guestNews = [];
    currentPageNmuber: number = 1;
    itemPerPage = 8;
    newsTotalRecords = 0;
    guestNewsRecords = 0;
    limitPerPage = [
        { value: '8' },
        { value: '16' },
        { value: '24' },
        { value: '32' },
        { value: '40' }
    ];
    constructor(
        private authService: AuthServiceService,
        private router: Router,
        private lang: LanguageService
    ) { }

    ngOnInit(): void {
        this.language = this.lang.getLanguaageFile();
        this.userData = JSON.parse(localStorage.getItem('user-data'));
        this.role = this.userData.roles[0];
        this.getAllNews();
       

    }

    getAllNews() {
        if (sessionStorage.getItem('token')) {
            this.authService.setLoader(true);
            let userId = localStorage.getItem('user-id');
            this.authService.memberSendRequest('get', 'news/user/' + userId, null)
                .subscribe(
                    (respData: any) => {
                        this.newsTotalRecords = respData.length;
                        this.dashboardData = respData;
                        if (this.role == 'guest') {
                            this.guestNews = [];
                            for (const key in this.dashboardData) {
                                if (Object.prototype.hasOwnProperty.call(this.dashboardData, key)) {
                                    const element = this.dashboardData[key];
                                    if (element.show_guest_list == 'true') {
                                        this.guestNews.push(element);
                                    }   
                                }
                            }
                            this.guestNewsRecords = this.guestNews.length;
                        }
                        this.authService.setLoader(false);
                    }
                );
        }
    }

    removeHtml(str) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = str;
        return tmp.textContent || tmp.innerText || "";
    }


    pageChanged(event) {
        this.currentPageNmuber = event;
    }

    goBack() {
        window.history.back();
    }

    goToPg(eve: number) {
        this.responseMessage = null;
        if (isNaN(eve)) {
            eve = this.currentPageNmuber;
        }
        else {
            if (eve > Math.round(164 / 8)) {
                this.responseMessage = this.language.error_message.invalid_pagenumber;
            }
            else {
                this.currentPageNmuber = eve;
            }
        }
    }

    setItemPerPage(limit: number) {
        if (isNaN(limit)) {
            limit = this.itemPerPage;
        }
      
        this.itemPerPage = limit;
    }

}
