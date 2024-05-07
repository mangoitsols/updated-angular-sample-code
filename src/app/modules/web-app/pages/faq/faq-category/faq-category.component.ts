import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { FAQCategory, LoginDetails, ThemeType } from '@core/models';
import { AuthService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;

@Component({
  selector: 'app-faq-category',
  templateUrl: './faq-category.component.html',
  styleUrls: ['./faq-category.component.css'],
  providers: [DatePipe],
})
export class FaqCategoryComponent implements OnInit, OnDestroy {
  language: any;
  userRole: string;
  userDetails: LoginDetails;
  editFormSubmit: boolean = false;
  editFaqForm: UntypedFormGroup;
  positionDropdownSettings: IDropdownSettings;
  positionSelectedItem: number;
  positionList: { id: number; name: number }[] = [];
  editId: number;
  getParamFromUrl: string;
  teamId: number;
  FaqCategory: FAQCategory[];
  setTheme: ThemeType;
  displayFaq: boolean;
  displayFaqCategory: boolean = true;
  private activatedSub: Subscription;
  FaqCat: FAQCategory;
  position: { id: number; name: number }[] = [];
  breadCrumbItems: Array<BreadcrumbItem>;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    translate: 'no',
    fonts: [{ class: 'gellix', name: 'Gellix' }],
    toolbarHiddenButtons: [
      [
        'link',
        'unlink',
        'subscript',
        'superscript',
        'insertUnorderedList',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
        'insertImage',
        'insertVideo',
        'italic',
        'fontSize',
        'undo',
        'redo',
        'underline',
        'strikeThrough',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'heading',
        'textColor',
        'backgroundColor',
        'customClasses',
        'insertOrderedList',
        'fontName',
      ],
    ],
    sanitize: true,
    toolbarPosition: 'top',
    defaultFontName: 'Arial',
    defaultFontSize: '2',
    defaultParagraphSeparator: 'p',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    public formBuilder: UntypedFormBuilder,
    private lang: LanguageService,
    private themes: ThemeService,
    private confirmDialogService: ConfirmDialogService,
    private notificationService: NotificationService
  ) {
    this.getParamFromUrl = this.router.url;
  }

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = this.userDetails.team_id;
    this.userRole = this.userDetails.roles[0];
    this.getAllFAQCategory();
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

    this.editFaqForm = this.formBuilder.group({
      category_title: ['', [Validators.required]],
      category_position: [''],
    });

    this.positionDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: false,
      enableCheckAll: false,
      closeDropDownOnSelection: true,
    };
    this.initBreadcrumb();
  }

  onFaq() {
    this.displayFaq = true;
    this.displayFaqCategory = false;
  }

  onFaqCategory() {
    this.displayFaqCategory = true;
    this.displayFaq = false;
  }

  onPositionItemSelect(item: { id: number; name: number }) {
    this.positionSelectedItem = item.id;
  }

  onPositionItemDeSelect(item: { id: number; name: number }) {
    this.positionSelectedItem = null;
    this.editFaqForm.controls['category_position'].setValue('');
  }

  getAllFAQCategory() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'category', null).subscribe(
      (respData: any) => {
        this.authService.setLoader(false);
        this.FaqCategory = respData;
      },
      error => {
        this.authService.setLoader(false);
      }
    );
  }

  editFAQcategoryById(id: number) {
    this.authService.setLoader(true);

    this.authService.memberSendRequest('get', 'categoriesById/' + id, null).subscribe(
      (respData: any) => {
        this.authService.setLoader(false);

        if (respData && respData.length > 0) {
          this.FaqCat = respData[0]; // Assign the first element directly
          this.editId = this.FaqCat.id; // Assuming id is needed for further processing
          this.position = []; // Reset position array
          this.setEditFAQCategory();
        }
      },
      error => {
        this.authService.setLoader(false);
      }
    );
  }

  setEditFAQCategory() {
    if (this.FaqCat.category_position) {
      if (this.positionList && this.positionList.length > 0) {
        this.positionList.forEach((val, key) => {
          if (val.id == this.FaqCat.category_position) {
            this.positionSelectedItem = val.id;
            this.position.push({ id: val.id, name: val.name });
            this.editFaqForm.controls['category_position'].setValue(this.position);
          }
        });
        this.editFaqForm.controls['category_title'].setValue(this.FaqCat.category_title);
      }
    } else if (this.FaqCat.category_position == null) {
      this.editFaqForm.controls['category_position'].setValue('');
      this.editFaqForm.controls['category_title'].setValue(this.FaqCat.category_title);
    }
    $('#exModal').modal('show');
    $('#editCat').click();
  }

  editFAQCategory() {
    this.editFormSubmit = true;
    if (this.positionSelectedItem) {
      this.editFaqForm.controls['category_position'].setValue(this.positionSelectedItem);
    }
    this.editFaqForm.value['team_id'] = this.teamId;
    this.editFaqForm.value['approved_status'] = this.FaqCat.approved_status;
    this.editFaqForm.value['author'] = this.FaqCat.author;
    this.authService.setLoader(true);
    this.authService.memberSendRequest('put', 'category/' + this.editId, this.editFaqForm.value).subscribe(
      (respData: any) => {
        this.authService.setLoader(false);
        // this.FaqCat = respData;
        if (respData['isError'] == false) {
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          this.getAllFAQCategory();
          setTimeout(() => {
            $('#exModal').modal('hide');
          }, 2000);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
          if (this.positionList?.length > 0) {
            this.positionList.forEach((val, key) => {
              if (val.id == this.FaqCat.category_position) {
                this.positionSelectedItem = val.id;
                this.position.push({ id: val.id, name: val.name });
                this.editFaqForm.controls['category_position'].setValue(this.position);
              }
            });
          }
          this.editFaqForm.value['approved_status'] = this.FaqCat.approved_status;
          this.editFaqForm.value['author'] = this.FaqCat.author;
        }
      },
      error => {
        this.authService.setLoader(false);
      }
    );
  }

  deleteCategory(id: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_category,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'category/' + id, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          if (respData['isError'] == false) {
            this.notificationService.showSuccess(respData['result']['message'], 'Success');
            this.getAllFAQCategory();
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
          }
        });
      },
      () => {}
    );
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [
      { label: this.language.Survey.vereins_tools, link: '/web/vereins-faq' },
      { label: this.language.create_faq.faq_category, link: '' },
    ];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
