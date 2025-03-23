import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DangnhapPage } from './dangnhap.page';

describe('DangnhapPage', () => {
  let component: DangnhapPage;
  let fixture: ComponentFixture<DangnhapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DangnhapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
