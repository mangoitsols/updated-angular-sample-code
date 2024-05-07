import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyDetailModalComponent } from './survey-detail-modal.component';

describe('SurveyDetailModalComponent', () => {
  let component: SurveyDetailModalComponent;
  let fixture: ComponentFixture<SurveyDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SurveyDetailModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
