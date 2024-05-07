import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsAddEditComponent } from './tags-add-edit.component';

describe('TagsAddEditComponent', () => {
  let component: TagsAddEditComponent;
  let fixture: ComponentFixture<TagsAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagsAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
