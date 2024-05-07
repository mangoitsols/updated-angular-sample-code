import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {LanguageService} from '@core/services';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.css']
})

export class PageNotFoundComponent implements OnInit {
    language :any;

    constructor(private _router: Router, private lang: LanguageService) { }

    ngOnInit(): void {
        this.language = this.lang.getLanguageFile();
    }

    goToDashboard() {
        this._router.navigate(['/web/dashboard']);
    }

}
