import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DenyReasonConfirmDialogComponent} from './deny-reason-confirm-dialog.component';

describe('DenyReasonConfirmDialogComponent', () => {
  let component: DenyReasonConfirmDialogComponent;
  let fixture: ComponentFixture<DenyReasonConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DenyReasonConfirmDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DenyReasonConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
