import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMyClubComponent } from './profile-my-club.component';

describe('ProfileMyClubComponent', () => {
  let component: ProfileMyClubComponent;
  let fixture: ComponentFixture<ProfileMyClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileMyClubComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMyClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
