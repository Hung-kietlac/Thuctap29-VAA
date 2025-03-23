import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketHistoryPage } from './ticket-history.page';

describe('TicketHistoryPage', () => {
  let component: TicketHistoryPage;
  let fixture: ComponentFixture<TicketHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
