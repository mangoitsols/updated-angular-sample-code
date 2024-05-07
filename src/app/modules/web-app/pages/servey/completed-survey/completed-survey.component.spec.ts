import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedSurveyComponent } from './completed-survey.component';

describe('CompletedSurveyComponent', () => {
  let component: CompletedSurveyComponent;
  let fixture: ComponentFixture<CompletedSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedSurveyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
