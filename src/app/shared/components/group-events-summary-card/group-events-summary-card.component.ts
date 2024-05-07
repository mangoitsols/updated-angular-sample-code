import { Component, Input, OnInit } from '@angular/core';
import { CommunityGroupEventEntity } from '@core/entities';
import { LanguageService } from '@core/services';

@Component({
  selector: 'vc-group-events-summary-card',
  templateUrl: './group-events-summary-card.component.html',
  styleUrls: ['./group-events-summary-card.component.scss'],
})
export class GroupEventsSummaryCardComponent implements OnInit {
  @Input() event: CommunityGroupEventEntity;
  @Input() isMobileView = false;
  readonly language: any;

  constructor(private _language: LanguageService) {
    this.language = this._language.getLanguageFile();
  }

  ngOnInit(): void {
    // this.event.recurringDates = JSON.parse(this.event.recurringDates);
  }
}
