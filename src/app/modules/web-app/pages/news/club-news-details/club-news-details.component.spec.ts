import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubNewsDetailsComponent } from './club-news-details.component';

describe('ClubNewsDetailsComponent', () => {
  let component: ClubNewsDetailsComponent;
  let fixture: ComponentFixture<ClubNewsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubNewsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubNewsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
