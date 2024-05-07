import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { LoginDetails, ParticipateAccess, UserAccess } from '@core/models';
import { AuthService, LanguageService, NotificationService } from '@core/services';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogService } from '@shared/components';
import { TagsAddEditComponent } from '../tags-add-edit-dialog/tags-add-edit.component';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { appSetting } from '@core/constants';

declare let $: any;

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsListComponent implements OnInit {
  userData: LoginDetails;
  language: any;
  nameSearch: any;
  displayedColumns: string[] = ['Name', 'Edit', 'Delete'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tagForm: FormGroup;
  isSubmitted: any = false;
  currentPageNumber: any = 0;
  itemPerPage: number = 10;
  totalTags: number = 0;
  limitPerPage: { value: string }[] = [{ value: '10' }, { value: '20' }, { value: '30' }, { value: '40' }, { value: '50' }];
  tagsList: any[] = [];
  currentSection: any = 'instructor';
  breadCrumbItems: Array<BreadcrumbItem>;
  tabsData: any[] = [];
  isData: boolean = true;
  participateAccess: ParticipateAccess;
  userAccess: UserAccess;
  constructor(private lang: LanguageService, public authService: AuthService, private formBuilder: FormBuilder, private dialog: MatDialog, private notificationService: NotificationService, private confirmDialogService: ConfirmDialogService) {
    this.tagForm = this.formBuilder.group({
      tag: ['', Validators.required],
      customerId: [''],
    });
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    let role = this.userData.roles[0];
    this.userAccess = appSetting.role;
    this.participateAccess = this.userAccess[role].participate;
    if (this.participateAccess?.tags == 'Yes') {
      this.getAllTags();
      this.initBreadcrumb();
    }

    this.tabsData = ['instructor', 'room', 'news', 'events', 'task', 'survey', 'courses'];
  }

  get formControls() {
    return this.tagForm.controls;
  }

  onTabClick(event: any) {
    this.currentSection = event.tab.textLabel.toLowerCase();
    this.currentPageNumber = 0;
    this.getAllTags();
    this.initBreadcrumb();
  }

  getAllTags() {
    this.tagsList = [];
    this.authService.setLoader(true);
    var endPoint = 'tags?page=' + (parseInt(this.currentPageNumber) + 1) + '&pageSize=' + this.itemPerPage + '&type=' + this.currentSection;
    this.authService.memberSendRequest('get', endPoint, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.tagsList = respData['result']['tags'];
        this.totalTags = respData['result'].pagination?.rowCount;
        this.isData = true;
      }
    });
  }

  // Call this method when your data is available or changes
  updateDataSource() {
    this.dataSource = new MatTableDataSource<any>(this.tagsList);
    this.dataSource.paginator = this.paginator;
  }

  openModal(data?: any) {
    const confirmDialog = this.dialog.open(TagsAddEditComponent, {
      data,
      disableClose: true,
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result == true) {
        this.getAllTags();
      }
    });
    confirmDialog.backdropClick().subscribe(() => {
      confirmDialog.close(); // Close the dialog when backdrop (outside the dialog) is clicked
    });
  }

  deleteTag(tagId: any) {
    this.confirmDialogService.confirmThis(
      this.language.tags.delete_mag,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteTag/' + tagId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          setTimeout(() => {
            this.ngOnInit();
          }, 2000);
        });
      },
      () => {}
    );
  }

  /**
   * Function is used to change the page of pagination
   * @author  MangoIt Solutions(M)
   */
  pageChanged(event: any) {
    this.itemPerPage = event.pageSize;
    this.currentPageNumber = event.pageIndex;
    this.getAllTags();
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Tags', link: '/web/tags-list' }];
  }
}
