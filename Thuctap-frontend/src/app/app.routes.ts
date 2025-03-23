import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dangnhap',
    pathMatch: 'full',
  },
  {
    path: 'dangky',
    loadComponent: () => import('./pages/dangky/dangky.page').then( m => m.DangkyPage)
  },
  {
    path: 'dangnhap',
    loadComponent: () => import('./pages/dangnhap/dangnhap.page').then( m => m.DangnhapPage)
  },
  {
    path: 'quenmatkhau',
    loadComponent: () => import('./pages/quenmatkhau/quenmatkhau.page').then( m => m.QuenmatkhauPage)
  },
  {
    path: 'doimatkhau',
    loadComponent: () => import('./pages/doimatkhau/doimatkhau.page').then( m => m.DoimatkhauPage)
  },
  {
    path: 'trangchu',
    loadComponent: () => import('./pages/trangchu/trangchu.page').then( m => m.TrangchuPage), canActivate: [AuthGuard]
  },
  {
    path: 'admin-footer',
    loadComponent: () => import('./pages/admin-footer/admin-footer.page').then( m => m.AdminFooterPage)
  },
  {
    path: 'admin-header',
    loadComponent: () => import('./pages/admin-header/admin-header.page').then( m => m.AdminHeaderPage)
  },
  {
    path: 'admin-sidebar',
    loadComponent: () => import('./pages/admin-sidebar/admin-sidebar.page').then( m => m.AdminSidebarPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'showtime',
    loadComponent: () => import('./pages/showtime/showtime.page').then( m => m.ShowtimePage)
  },
  {
    path: 'ticket-history',
    loadComponent: () => import('./pages/ticket-history/ticket-history.page').then( m => m.TicketHistoryPage)
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.page').then( m => m.UsersPage)
  },
  {
    path: 'header',
    loadComponent: () => import('./shared/header/header.page').then( m => m.HeaderPage)
  },
  {
    path: 'footer',
    loadComponent: () => import('./shared/footer/footer.page').then( m => m.FooterPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/details/details.page').then( m => m.DetailsPage)
  },
  {
    path: 'book-ticket',
    loadComponent: () => import('./pages/book-ticket/book-ticket.page').then( m => m.BookTicketPage)
  },
];