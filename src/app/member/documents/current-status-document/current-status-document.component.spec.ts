import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentStatusDocumentComponent } from './current-status-document.component';

describe('CurrentStatusDocumentComponent', () => {
  let component: CurrentStatusDocumentComponent;
  let fixture: ComponentFixture<CurrentStatusDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentStatusDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentStatusDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
