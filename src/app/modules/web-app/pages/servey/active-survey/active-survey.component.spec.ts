import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSurveyComponent } from './active-survey.component';

describe('ActiveSurveyComponent', () => {
  let component: ActiveSurveyComponent;
  let fixture: ComponentFixture<ActiveSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveSurveyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
