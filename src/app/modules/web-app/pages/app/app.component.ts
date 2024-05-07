import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

@Component({
  selector: 'app-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  language: any;
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(private lang: LanguageService) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.initBreadcrumb();
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Setup', link: '' }, { label: this.language.dashboard.mobile_app }];
  }
}
