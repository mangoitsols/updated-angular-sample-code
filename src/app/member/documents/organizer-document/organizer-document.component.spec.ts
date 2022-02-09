import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerDocumentComponent } from './organizer-document.component';

describe('OrganizerDocumentComponent', () => {
  let component: OrganizerDocumentComponent;
  let fixture: ComponentFixture<OrganizerDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizerDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizerDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
