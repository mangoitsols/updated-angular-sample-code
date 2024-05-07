import { Component, Input, OnInit } from '@angular/core';
import { CommunityGroupEventEntity } from '@core/entities';
import { LanguageService } from '@core/services';

@Component({
  selector: 'vc-group-event-summary-card-horizontal',
  templateUrl: './group-event-summary-card-horizontal.component.html',
  styleUrls: ['./group-event-summary-card-horizontal.component.scss'],
})
export class GroupEventSummaryCardHorizontalComponent implements OnInit {
  @Input() event: CommunityGroupEventEntity;
  readonly language: any;

  constructor(private _language: LanguageService) {
    this.language = this._language.getLanguageFile();
  }

  ngOnInit(): void {}
}
