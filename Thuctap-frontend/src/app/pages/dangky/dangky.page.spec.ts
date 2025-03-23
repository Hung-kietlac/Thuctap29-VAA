import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DangkyPage } from './dangky.page';

describe('DangkyPage', () => {
  let component: DangkyPage;
  let fixture: ComponentFixture<DangkyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DangkyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
