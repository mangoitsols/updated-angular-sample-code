import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileClubComponent } from './profile-club.component';

describe('ProfileClubComponent', () => {
  let component: ProfileClubComponent;
  let fixture: ComponentFixture<ProfileClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileClubComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
