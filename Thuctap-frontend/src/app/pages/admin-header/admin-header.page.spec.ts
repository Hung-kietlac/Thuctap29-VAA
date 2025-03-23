import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminHeaderPage } from './admin-header.page';

describe('AdminHeaderPage', () => {
  let component: AdminHeaderPage;
  let fixture: ComponentFixture<AdminHeaderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
