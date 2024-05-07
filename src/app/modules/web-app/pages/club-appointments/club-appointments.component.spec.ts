import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubAppointmentsComponent } from './club-appointments.component';

describe('ClubAppointmentsComponent', () => {
  let component: ClubAppointmentsComponent;
  let fixture: ComponentFixture<ClubAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubAppointmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
