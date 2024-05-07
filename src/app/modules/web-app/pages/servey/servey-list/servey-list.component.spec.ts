import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServeyListComponent } from './servey-list.component';

describe('ServeyListComponent', () => {
  let component: ServeyListComponent;
  let fixture: ComponentFixture<ServeyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServeyListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServeyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
