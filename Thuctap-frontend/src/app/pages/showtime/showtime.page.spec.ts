import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowtimePage } from './showtime.page';

describe('ShowtimePage', () => {
  let component: ShowtimePage;
  let fixture: ComponentFixture<ShowtimePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowtimePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

