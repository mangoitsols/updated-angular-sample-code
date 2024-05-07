import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageInfoDialogComponent } from './message-info-dialog.component';

describe('MessageInfoDialogComponent', () => {
  let component: MessageInfoDialogComponent;
  let fixture: ComponentFixture<MessageInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageInfoDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
