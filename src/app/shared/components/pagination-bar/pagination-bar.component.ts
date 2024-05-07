import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Pagination } from '@core/entities/_extra/paginated.entity';
import { SharedModule } from '@shared/shared.module';
import { LanguageService } from '@core/services';

@Component({
  selector: 'vc-pagination-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './pagination-bar.component.html',
  styleUrls: ['./pagination-bar.component.scss'],
})
/**
 * The PaginationBarComponent is a standalone component that displays a pagination bar with page
 * numbers, page size selector, and previous and next buttons.
 *
 * NEW: Added isFrontendPagination, fullDataArray, and paginatedData properties to support frontend pagination.
 * @property {boolean} isFrontendPagination - Whether to use frontend pagination or server-side pagination.
 * @property {any[]} fullDataArray - The full data array to be paginated.
 * @property {EventEmitter<any[]>} paginatedData - The paginated data array to be emitted.
 *
 *
 * @property {Pagination} pagination - The pagination object that contains the page, pageSize,
 * rowCount and pageCount properties.
 * @property {boolean} showPageSizeSelector - Whether to show the page size selector dropdown.
 * @property {boolean} showPagination - Whether to show the page size selector dropdown.
 * @property {number[]} itemsPerPageOptions - The page size options to show in the page size selector
 * dropdown.
 * @property {boolean} showFirstLastButtons - Whether to show the first and last page buttons.
 * @property {boolean} showPreviousNextButtons - Whether to show the previous and next page buttons.
 * @property {boolean} showEllipsis - Whether to show the ellipsis (...) if page number exceeds 6.
 * @property {number} defaultItemsPerPage - The default page size to use if the pagination object does
 * not have a pageSize property.
 * @property {string} selectedPageBgColor - The background color of the selected page buttons.
 * @property {string} selectedPageTextColor - The text color of the selected page buttons.
 * @property {boolean} loading - If true, the pagination bar will be disabled.
 * @property {EventEmitter<number>} pageChanged - Emits the new page number when the page is changed.
 * @property {EventEmitter<number>} pageSizeChanged - Emits the new page size when the page size is
 * changed.
 *
 * @example
 * <vc-pagination-bar [pagination]="pagination"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [showPageSizeSelector]="false"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [showPagination]="false"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [showFirstLastButtons]="false"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [showPreviousNextButtons]="false"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [showEllipsis]="false"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [defaultItemsPerPage]="20"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [selectedPageBgColor]="'var(--vc-color-dark-pink)'"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [selectedPageTextColor]="'#ffffff'"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" [loading]="true"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" (pageChanged)="changePage($event)"></vc-pagination-bar>
 * <vc-pagination-bar [pagination]="pagination" (pageSizeChanged)="changePageSize($event)"></vc-pagination-bar>
 *
 * NEW: <vc-pagination-bar [isFrontendPagination]="true" [fullDataArray]="fullDataArray" [paginatedData]="paginatedData"></vc-pagination-bar>
 */
export class PaginationBarComponent implements OnInit {
  /**
   * Whether to use frontend pagination or server-side pagination.
   * To be used only if frontend pagination is required and the full data array is provided.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [isFrontendPagination]="true"></vc-pagination-bar>
   */
  @Input() isFrontendPagination = false;

  /**
   * The full data array to be paginated.
   * To be used only if isFrontendPagination is true.
   * @type {any[]}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [isFrontendPagination]="true" [fullDataArray]="fullDataArray"></vc-pagination-bar>
   */
  @Input() fullDataArray: any[] = [];

  /**
   * The paginated data array to be emitted.
   * To be used only if isFrontendPagination is true and the full data array is provided.
   * @type {any[]}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [isFrontendPagination]="true" [fullDataArray]="fullDataArray" [paginatedData]="paginatedData"></vc-pagination-bar>
   */
  @Output() paginatedData = new EventEmitter<any[]>();

  /**
   * The pagination object that contains the page, pageSize, rowCount and pageCount
   * properties.
   * @type {Pagination}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [pagination]="pagination"></vc-pagination-bar>
   */
  @Input() pagination: Pagination;

  /**
   * Whether to show the page size selector dropdown.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [showPageSizeSelector]="false"></vc-pagination-bar>
   */
  @Input() showPageSizeSelector = true;

  /**
   * Whether to show the page size selector dropdown.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [showPageSizeSelector]="false"></vc-pagination-bar>
   */
  @Input() showPagination = true;

  /**
   * The page size options to show in the page size selector dropdown.
   * @type {number[]}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [itemsPerPageOptions]="[10, 20, 50, 100]"></vc-pagination-bar>
   */
  @Input() itemsPerPageOptions: number[] = [10, 20, 50, 100];

  /**
   * Whether to show the first and last page buttons.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [showFirstLastButtons]="false"></vc-pagination-bar>
   */
  @Input() showFirstLastButtons: boolean = false;

  /**
   * Whether to show the previous and next page buttons.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [showPreviousNextButtons]="false"></vc-pagination-bar>
   */
  @Input() showPreviousNextButtons = true;

  /**
   * Whether to show the ellipsis (...) if page number exceeds 6.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [showEllipsis]="false"></vc-pagination-bar>
   */
  @Input() showEllipsis = true;

  /**
   * The default page size to use if the pagination object does not have a pageSize property.
   * @type {number}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [defaultItemsPerPage]="20"></vc-pagination-bar>
   */
  @Input() defaultItemsPerPage = this.itemsPerPageOptions[0];

  /**
   * The background color of the selected page buttons.
   * @type {string}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [pageBgColor]="'var(--vc-color-dark-pink)'"></vc-pagination-bar>
   */
  @Input() selectedPageBgColor = 'var(--vc-color-dark-pink)';

  /**
   * The text color of the selected page buttons.
   * @type {string}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [pageTextColor]="'#ffffff'"></vc-pagination-bar>
   */
  @Input() selectedPageTextColor = '#ffffff';

  /**
   * If true, the pagination bar will be disabled.
   * @type {boolean}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar [loading]="true"></vc-pagination-bar>
   */
  @Input() loading = false;

  /**
   * Emits the new page number when the page is changed.
   * @type {EventEmitter<number>}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar (pageChanged)="changePage($event)"></vc-pagination-bar>
   */
  @Output() pageChanged = new EventEmitter<number>();

  /**
   * Emits the new page size when the page size is changed.
   * @type {EventEmitter<number>}
   * @memberof PaginationBarComponent
   * @example
   * <vc-pagination-bar (pageSizeChanged)="changePageSize($event)"></vc-pagination-bar>
   */
  @Output() pageSizeChanged = new EventEmitter<number>();

  isDropdownOpen = false;
  language: any;

  constructor(private _language: LanguageService) {
    this.language = _language.getLanguageFile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    // Check if the click is outside of the dropdown
    if (targetElement && !targetElement.closest('.vc-mini-dropdown')) {
      this.isDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    if (this.pagination && !this.pagination.pageSize) {
      this.pagination.pageSize = this.defaultItemsPerPage;
    }
    // If it's frontend pagination, initialize the pagination on the full dataset
    if (this.isFrontendPagination) {
      this.pagination = this.pagination || {
        page: 1,
        pageSize: this.defaultItemsPerPage,
        rowCount: this.fullDataArray ? this.fullDataArray.length : 0,
        pageCount: this.fullDataArray ? Math.ceil(this.fullDataArray.length / this.defaultItemsPerPage) : 0,
      };
      this._paginateData();
    }

    if (this.itemsPerPageOptions && this.itemsPerPageOptions.length) {
      this.defaultItemsPerPage = this.itemsPerPageOptions[0];
    }
  }

  /**
   * The function "changePage" updates the current page number and emits an event if the new page is
   * valid.
   * @param {number} newPage - The newPage parameter is a number that represents the page number that we
   * want to change to.
   */
  changePage(newPage: number): void {
    if (newPage !== this.pagination.page && newPage > 0 && newPage <= this.pagination.pageCount) {
      this.pagination.page = newPage;
      this.pageChanged.emit(newPage);
      if (this.isFrontendPagination) {
        this._paginateData();
      }
    }
  }

  /**
   * The function "onPageSizeChange" updates the page size and resets the current page to the first page
   * when the page size is changed, and emits events to notify other components of the changes.
   * @param {number} newSize - The `newSize` parameter is a number that represents the new page size that
   * the user has selected.
   */
  onPageSizeChange(newSize: number): void {
    if (newSize !== this.pagination.pageSize) {
      this.pagination.page = 1;
      this.pagination.pageSize = newSize;
      this.pageSizeChanged.emit(this.pagination.pageSize);
      if (this.isFrontendPagination) {
        this._paginateData();
      } else {
        // Update pageCount for server-side pagination
        this.pagination.pageCount = Math.ceil(this.pagination.rowCount / this.pagination.pageSize);
      }
      this.pageChanged.emit(1);
    }
    this.isDropdownOpen = false;
  }

  /**
   * The function `getPages` returns an array of page numbers or ellipses based on the current pagination
   * state.
   * @returns The function `getPages()` returns an array of numbers or strings.
   */
  getPages(): Array<number | string> {
    const pageNumbers = [];
    let startPage: number, endPage: number;

    if (this.pagination.pageCount <= 6) {
      // less than 6 total pages so show all
      startPage = 1;
      endPage = this.pagination.pageCount;
    } else {
      // more than 6 total pages so calculate start and end pages
      if (this.pagination.page <= 4) {
        startPage = 1;
        endPage = 6;
      } else if (this.pagination.page + 2 >= this.pagination.pageCount) {
        startPage = this.pagination.pageCount - 5;
        endPage = this.pagination.pageCount;
      } else {
        startPage = this.pagination.page - 2;
        endPage = this.pagination.page + 3;
      }
    }

    // create an array of pages to ng-repeat in the pager control
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // add ellipses
    if (this.showEllipsis) {
      if (startPage > 1) {
        pageNumbers.unshift('...');
      }

      if (endPage < this.pagination.pageCount) {
        pageNumbers.push('...');
      }
    }

    return pageNumbers;
  }

  /**
   * The function toggleDropdown toggles the value of the isDropdownOpen variable.
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private _paginateData(): void {
    // Check if the fullDataArray and pagination are defined
    if (this.fullDataArray && this.pagination) {
      const start = (this.pagination.page - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      const paginatedItems = this.fullDataArray.slice(start, end);
      this.paginatedData.emit(paginatedItems); // Emit the new slice of data

      // Update pageCount for frontend pagination
      this.pagination.pageCount = Math.ceil(this.fullDataArray.length / this.pagination.pageSize);
    }
  }
}
