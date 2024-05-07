import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerPersonalTaskComponent } from './organizer-personal-task.component';

describe('OrganizerPersonalTaskComponent', () => {
  let component: OrganizerPersonalTaskComponent;
  let fixture: ComponentFixture<OrganizerPersonalTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizerPersonalTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizerPersonalTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
