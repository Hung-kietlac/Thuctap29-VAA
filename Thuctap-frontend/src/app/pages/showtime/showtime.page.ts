import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-showtime',
  templateUrl: './showtime.page.html',
  styleUrls: ['./showtime.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule
  ]
})
export class ShowtimePage implements OnInit {
  // Selected segment tab
  selectedSegment = 'showtimes';

  constructor() { }

  ngOnInit() {
    // Initialization logic can go here
  }
}