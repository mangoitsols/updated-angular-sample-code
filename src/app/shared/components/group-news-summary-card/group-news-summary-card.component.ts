import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommunityGroupNewsEntity } from '@core/entities/community-groups/community-group-news.entity';
import { MgroupNewsDetailsComponent } from '@modules/mobile-app/shared/mgroup-news-details/mgroup-news-details.component';
import { DialogService } from '@ngneat/dialog';
import { GroupNewsDetailDialogComponent } from '@shared/components';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LanguageService } from '@core/services';

@UntilDestroy()
@Component({
  selector: 'vc-group-news-summary-card',
  templateUrl: './group-news-summary-card.component.html',
  styleUrls: ['./group-news-summary-card.component.scss'],
})
export class GroupNewsSummaryCardComponent implements OnInit {
  @Input() news: CommunityGroupNewsEntity;
  @Input() isMobileView = false;
  @Output() selectedNewsId: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectedNews: EventEmitter<CommunityGroupNewsEntity> = new EventEmitter<CommunityGroupNewsEntity>();
  @Output() refresh: EventEmitter<boolean> = new EventEmitter<boolean>();
  language: any;
  private dialog = inject(DialogService);

  constructor(private _language: LanguageService) {
    this.language = this._language.getLanguageFile();
  }

  ngOnInit(): void {}

  openNewsDetailModal(news: any) {
    setTimeout(() => {
      const dialog = this.dialog.open(this.isMobileView ? MgroupNewsDetailsComponent : GroupNewsDetailDialogComponent, {
        windowClass: this.isMobileView ? 'mobile-news-dialog' : 'web-news-dialog',
        data: {
          news,
          newsId: news.id,
        },
      });
      dialog.afterClosed$.pipe(untilDestroyed(this)).subscribe(result => {
        this.refresh.emit(result);
      });
    }, 250);
  }
}
