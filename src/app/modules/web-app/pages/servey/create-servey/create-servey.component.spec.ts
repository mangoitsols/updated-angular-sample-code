import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServeyComponent } from './create-servey.component';

describe('CreateServeyComponent', () => {
  let component: CreateServeyComponent;
  let fixture: ComponentFixture<CreateServeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateServeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateServeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
