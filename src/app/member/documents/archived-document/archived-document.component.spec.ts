import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedDocumentComponent } from './archived-document.component';

describe('ArchivedDocumentComponent', () => {
  let component: ArchivedDocumentComponent;
  let fixture: ComponentFixture<ArchivedDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchivedDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
