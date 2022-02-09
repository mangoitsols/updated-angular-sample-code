import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubDocumentComponent } from './club-document.component';

describe('ClubDocumentComponent', () => {
  let component: ClubDocumentComponent;
  let fixture: ComponentFixture<ClubDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
