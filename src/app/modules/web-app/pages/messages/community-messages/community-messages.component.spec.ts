import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityMessagesComponent } from './community-messages.component';

describe('CommunityMessagesComponent', () => {
  let component: CommunityMessagesComponent;
  let fixture: ComponentFixture<CommunityMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunityMessagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
