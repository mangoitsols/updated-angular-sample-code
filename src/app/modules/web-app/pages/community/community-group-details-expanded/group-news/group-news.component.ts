import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommunityGroupNewsEntity, PaginatedEntity, Pagination } from '@core/entities';
import { FilterQuery } from '@core/types';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '@core/services';
import { removeNullAndUndefinedProperties } from '@core/utils';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'vc-group-news',
  templateUrl: './group-news.component.html',
  styleUrls: ['./group-news.component.scss'],
})
export class GroupNewsComponent {
  groupId: string;
  readonly language: any;

  isLoading = true;
  groupNews: CommunityGroupNewsEntity[] = [];
  pagination: Pagination = new PaginatedEntity().pagination;
  private _useCommunityGroupNews = new UseCommunityGroups();

  constructor(private _router: ActivatedRoute, private _lang: LanguageService, private _changeDetectorRef: ChangeDetectorRef) {
    this.groupId = this._router.parent?.snapshot.params.id;
    this.language = this._lang.getLanguageFile();
  }

  private _filterQuery: FilterQuery;

  get filterQuery(): FilterQuery {
    return this._filterQuery;
  }

  @Input() set filterQuery(value: FilterQuery) {
    if (value) {
      this._filterQuery = { ...value, ...this.pagination };
      this.isLoading = true;
      this._fetchGroupNews();
    }
  }

  changePage(pageNumber: number) {
    this.pagination.page = pageNumber;
    this.filterQuery = { ...this.filterQuery, ...this.pagination };
    this.isLoading = true;
    this._fetchGroupNews();
  }

  changePageSize(pageSize: number) {
    this.pagination.pageSize = pageSize;
    this.filterQuery = { ...this.filterQuery, ...this.pagination };
    this.isLoading = true;
    this._fetchGroupNews();
  }

  reloadData(event: boolean) {
    if (event) {
      this.isLoading = true;
      setTimeout(() => {
        this._fetchGroupNews();
      }, 1000);
    }
  }

  private _fetchGroupNews(): void {
    const filterQuery = removeNullAndUndefinedProperties(this.filterQuery);
    this._useCommunityGroupNews
      .getGroupNews(+this.groupId, filterQuery)
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        this.groupNews = resp.groupNews;
        this.pagination = resp.pagination;
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
}
