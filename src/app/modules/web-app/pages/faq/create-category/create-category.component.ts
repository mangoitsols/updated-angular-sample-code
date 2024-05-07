import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { LoginDetails, ThemeType } from '@core/models';
import { AuthService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.css'],
})
export class CreateCategoryComponent implements OnInit, OnDestroy {
  language: any;
  categoryForm: UntypedFormGroup;
  formSubmit: boolean = false;
  positionSelectedItem: number = 0;
  responseMessage: string;
  positionDropdownSettings: IDropdownSettings;
  positionList: { id: number; name: number }[] = [];
  teamId: number;
  setTheme: ThemeType;
  approved_status: number;
  private activatedSub: Subscription;
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(
    public formBuilder: UntypedFormBuilder,
    private themes: ThemeService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService,
    private lang: LanguageService,
    public navigation: NavigationService
  ) {}

  ngOnInit() {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
    let userId: string = localStorage.getItem('user-id');
    if (userData.isAdmin || userData.isFunctionary) {
      this.approved_status = 1;
    } else {
      this.approved_status = 0;
    }
    this.teamId = userData.team_id;
    this.positionList = [
      { id: 1, name: 1 },
      { id: 2, name: 2 },
      { id: 3, name: 3 },
      { id: 4, name: 4 },
      { id: 5, name: 5 },
      { id: 6, name: 6 },
      { id: 7, name: 7 },
      { id: 8, name: 8 },
      { id: 9, name: 9 },
      { id: 10, name: 10 },
    ];

    this.initBreadcrumb();

    this.categoryForm = this.formBuilder.group({
      category_title: ['', [Validators.required]],
      category_position: [''],
      author: [userId],
      approved_status: [this.approved_status],
    });

    this.positionDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };
  }

  onPositionItemSelect(item: { id: number; name: number }) {
    if (item.id) {
      this.positionSelectedItem = item.id;
    }
  }

  onPositionItemDeSelect(item: { id: number; name: number }) {
    this.positionSelectedItem = 0;
  }

  createCategory() {
    this.formSubmit = true;
    if (this.formSubmit && this.categoryForm.valid) {
      if (this.positionSelectedItem == 0) {
        this.categoryForm.controls['category_position'].setValue('');
      } else {
        this.categoryForm.controls['category_position'].setValue(this.positionSelectedItem);
      }
      this.categoryForm.value['team_id'] = this.teamId;
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createCategory', this.categoryForm.value).subscribe(
        (respData: any) => {
          this.authService.setLoader(false);
          if (respData['isError'] == false) {
            this.notificationService.showSuccess(respData['result']['message'], 'Success');
            setTimeout(() => {
              this.router.navigate(['/web/faq-category']);
            }, 2000);
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
            if (this.categoryForm.value?.category_position) {
              let position: any[] = [];
              if (this.positionList?.length > 0) {
                this.positionList.forEach((val, key) => {
                  if (val.id == this.categoryForm.value.category_position) {
                    position.push({ id: val.id, name: val.name });
                    this.categoryForm.controls['category_position'].setValue(position);
                  }
                });
              }
            }
          }
        },
        error => {
          this.authService.setLoader(false);
        }
      );
    }
  }
  onCancel() {
    window.history.back();
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Organizer', link: ' ' }, { label: this.language.create_faq.create_category }];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
