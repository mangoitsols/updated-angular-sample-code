import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServeyComponent } from './servey.component';

describe('ServeyComponent', () => {
  let component: ServeyComponent;
  let fixture: ComponentFixture<ServeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
