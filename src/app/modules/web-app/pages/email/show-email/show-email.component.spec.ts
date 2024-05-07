import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEmailComponent } from './show-email.component';

describe('ShowEmailComponent', () => {
  let component: ShowEmailComponent;
  let fixture: ComponentFixture<ShowEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowEmailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
