import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderPage } from '../../shared/header/header.page';
import { FooterPage } from '../../shared/footer/footer.page';


@Component({
  selector: 'app-bookticket',
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderPage, FooterPage],
  templateUrl: './bookticket.page.html',
  styleUrls: ['./bookticket.page.scss']
})
export class BookTicketPage {

}