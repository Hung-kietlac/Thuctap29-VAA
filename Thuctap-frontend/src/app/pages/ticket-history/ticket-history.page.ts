import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ticket-history',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './ticket-history.page.html',
  styleUrls: ['./ticket-history.page.scss'],
})
export class  TicketHistoryPage implements OnInit {
  dulieu: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  loadDulieu() {
    this.http.get<{dulieu: any[]}>
  }
}