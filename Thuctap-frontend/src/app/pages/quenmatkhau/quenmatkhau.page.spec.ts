import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuenmatkhauPage } from './quenmatkhau.page';

describe('QuenmatkhauPage', () => {
  let component: QuenmatkhauPage;
  let fixture: ComponentFixture<QuenmatkhauPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuenmatkhauPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
