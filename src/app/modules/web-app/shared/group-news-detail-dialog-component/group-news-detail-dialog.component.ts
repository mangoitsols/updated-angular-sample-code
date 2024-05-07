import { Component, HostListener, Input, OnInit } from '@angular/core';
import { LoginDetails, ThemeType } from '@core/models';
import { LanguageService } from '@core/services';
import { DialogRef } from '@ngneat/dialog';
import { CommunityGroupNewsEntity } from '@core/entities';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { ConfirmDialogService } from '@shared/components';

@UntilDestroy()
@Component({
  selector: 'app-group-news-detail-dialog-component',
  templateUrl: './group-news-detail-dialog.component.html',
  styleUrls: ['./group-news-detail-dialog.component.scss'],
})
export class GroupNewsDetailDialogComponent implements OnInit {
  @Input() newsId: any;
  @Input() news: CommunityGroupNewsEntity;
  language: any;
  newImg: string;
  setTheme: ThemeType;
  userData: LoginDetails;
  thumbnail: any;
  private _useCommunityGroupNews = new UseCommunityGroups();

  constructor(private _lang: LanguageService, private _confirmDialogService: ConfirmDialogService, private _ref: DialogRef, private _router: Router) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !targetElement.closest('.w-news-dialog')) {
      this.closeModal();
    }
  }

  ngOnInit(): void {
    this.language = this._lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.newsId = this._ref.data.newsId;
    this.news = this._ref.data.news;
    if (!this.news && this.newsId) {
      this._getNewsDetailsById(this.newsId);
    }
    this._getUserPhoto();
  }

  updateNews(newsId: number) {
    if (!newsId) {
      return;
    }
    this._router.navigate(['web/update-news', newsId]).then(e => {
      this.closeModal();
    });
  }

  deleteNews(newsId: number) {
    if (!newsId) {
      return;
    }

    this._confirmDialogService.confirmThis(
      `${this.language?.confirmation_message?.deleteNewsConfirm_popup}`,
      () => {
        this._useCommunityGroupNews
          .deleteGroupNews(newsId)
          .pipe(untilDestroyed(this))
          .subscribe((respData: any) => {
            this.closeModal(true);
          });
      },
      () => {}
    );
  }

  closeModal(update = false) {
    this._ref.close(update);
  }

  private _getNewsDetailsById(newsId: number) {
    this._useCommunityGroupNews
      .getGroupNewsById(newsId)
      .pipe(untilDestroyed(this))
      .subscribe((respData: CommunityGroupNewsEntity) => {
        this.news = respData;
      });
  }

  private _getUserPhoto() {
    this._useCommunityGroupNews
      .getUserPhoto(this.userData.member_id)
      .pipe(untilDestroyed(this))
      .subscribe((respData: any) => {
        this.thumbnail = respData;
      });
  }
}
