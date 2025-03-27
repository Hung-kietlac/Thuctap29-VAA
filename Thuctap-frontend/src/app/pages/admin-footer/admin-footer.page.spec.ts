import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFooterPage } from './admin-footer.page';

describe('AdminFooterPage', () => {
  let component: AdminFooterPage;
  let fixture: ComponentFixture<AdminFooterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFooterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
