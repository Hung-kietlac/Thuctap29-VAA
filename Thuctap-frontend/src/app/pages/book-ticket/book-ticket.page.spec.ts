import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookTicketPage } from './book-ticket.page';

describe('BookTicketPage', () => {
  let component: BookTicketPage;
  let fixture: ComponentFixture<BookTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
