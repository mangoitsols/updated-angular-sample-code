import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerGroupTaskComponent } from './organizer-group-task.component';

describe('OrganizerGroupTaskComponent', () => {
  let component: OrganizerGroupTaskComponent;
  let fixture: ComponentFixture<OrganizerGroupTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizerGroupTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizerGroupTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
