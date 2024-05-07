import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerCreatedTaskComponent } from './organizer-created-task.component';

describe('OrganizerCreatedTaskComponent', () => {
  let component: OrganizerCreatedTaskComponent;
  let fixture: ComponentFixture<OrganizerCreatedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizerCreatedTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizerCreatedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
