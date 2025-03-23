import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrangchuPage } from './trangchu.page';

describe('TrangchuPage', () => {
  let component: TrangchuPage;
  let fixture: ComponentFixture<TrangchuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrangchuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
