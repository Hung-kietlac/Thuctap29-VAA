import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSidebarPage } from './admin-sidebar.page';

describe('AdminSidebarPage', () => {
  let component: AdminSidebarPage;
  let fixture: ComponentFixture<AdminSidebarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSidebarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
