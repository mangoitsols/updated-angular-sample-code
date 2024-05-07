import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '@core/services';
import { removeNullAndUndefinedProperties } from '@core/utils';
import { FilterQuery } from '@core/types';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { CommunityGroupEventEntity } from '@core/entities';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-group-events',
  templateUrl: './group-events.component.html',
  styleUrls: ['./group-events.component.scss'],
})
export class GroupEventsComponent implements OnInit {
  groupId: string;
  language: any;
  isLoading = true;
  displayListView: boolean;
  @Input() filters: any;
  paginatedGroupEvents: CommunityGroupEventEntity[] = [];
  private _useCommunityGroupEvents = new UseCommunityGroups();

  constructor(private _router: ActivatedRoute, private lang: LanguageService) {
    this.groupId = this._router.parent?.snapshot.params.id;
  }

  private _groupEvents: CommunityGroupEventEntity[];

  get groupEvents(): CommunityGroupEventEntity[] {
    return this._groupEvents;
  }

  set groupEvents(value: CommunityGroupEventEntity[]) {
    this._groupEvents = value;
  }

  private _filterQuery: FilterQuery;

  get filterQuery(): FilterQuery {
    return this._filterQuery;
  }

  @Input() set filterQuery(value: FilterQuery) {
    this._filterQuery = value;
    this.isLoading = true;
    this.getGroupEvents();
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.getGroupEvents();
  }

  getGroupEvents() {
    const filterQuery = removeNullAndUndefinedProperties(this.filterQuery);
    this._useCommunityGroupEvents
      .getFilteredGroupEvents(+this.groupId, filterQuery)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.groupEvents = res;
        this.groupEvents.sort((a, b) => {
          const dateA = new Date(a.dateFrom).getTime();
          const dateB = new Date(b.dateFrom).getTime();
          return dateA - dateB;
        });
        this.isLoading = false;
      });
  }

  updatePaginatedData(data: CommunityGroupEventEntity[]) {
    this.paginatedGroupEvents = data as CommunityGroupEventEntity[];
  }
}
