import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VereinsFaqComponent } from './vereins-faq.component';

describe('VereinsFaqComponent', () => {
  let component: VereinsFaqComponent;
  let fixture: ComponentFixture<VereinsFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VereinsFaqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VereinsFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
