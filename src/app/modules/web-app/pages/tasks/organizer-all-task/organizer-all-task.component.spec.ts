import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerAllTaskComponent } from './organizer-all-task.component';

describe('OrganizerAllTaskComponent', () => {
  let component: OrganizerAllTaskComponent;
  let fixture: ComponentFixture<OrganizerAllTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizerAllTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizerAllTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
