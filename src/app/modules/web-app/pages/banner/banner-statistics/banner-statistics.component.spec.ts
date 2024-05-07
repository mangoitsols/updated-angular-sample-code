import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerStatisticsComponent } from './banner-statistics.component';

describe('BannerStatisticsComponent', () => {
  let component: BannerStatisticsComponent;
  let fixture: ComponentFixture<BannerStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerStatisticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
