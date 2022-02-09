import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubAllNewsComponent } from './club-all-news.component';

describe('ClubAllNewsComponent', () => {
  let component: ClubAllNewsComponent;
  let fixture: ComponentFixture<ClubAllNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubAllNewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubAllNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
