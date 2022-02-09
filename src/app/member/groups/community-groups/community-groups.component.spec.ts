import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityGroupsComponent } from './community-groups.component';

describe('CommunityGroupsComponent', () => {
  let component: CommunityGroupsComponent;
  let fixture: ComponentFixture<CommunityGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunityGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
