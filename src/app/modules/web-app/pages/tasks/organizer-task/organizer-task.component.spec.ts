import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerTaskComponent } from './organizer-task.component';

describe('OrganizerTaskComponent', () => {
  let component: OrganizerTaskComponent;
  let fixture: ComponentFixture<OrganizerTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizerTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizerTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
