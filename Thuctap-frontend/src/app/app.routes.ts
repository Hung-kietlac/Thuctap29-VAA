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
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage), canActivate: [AuthGuard]
  },
  {
    path: 'admin/phim',
    loadComponent: () => import('./pages/admin/phim-management/phim-management.component').then( m => m.PhimManagementComponent), canActivate: [AuthGuard]
  },
  {
    path: 'admin/suatchieu',
    loadComponent: () => import('./pages/admin/suatchieu-management/suatchieu-management.component').then( m => m.SuatChieuManagementComponent), canActivate: [AuthGuard]
  },
  {
    path: 'admin/ve',
    loadComponent: () => import('./pages/admin/ve-management/ve-management.component').then( m => m.VeManagementComponent), canActivate: [AuthGuard]
  },
  {
    path: 'admin/dichvu',
    loadComponent: () => import('./pages/admin/dichvu-management/dichvu-management.component').then( m => m.DichVuManagementComponent), canActivate: [AuthGuard]
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
    path: 'details/',
    loadComponent: () => import('./pages/details/details.page').then( m => m.DetailsPage)
  },
  {
    path: 'book-ticket',
    loadComponent: () => import('./pages/book-ticket/book-ticket.page').then( m => m.BookTicketPage)
  },
  {
    path: 'admin/phongchieu',
    loadComponent: () => import('./pages/admin/phongchieu-management/phongchieu-management.component').then(m => m.PhongChieuManagementComponent),
    canActivate: [AuthGuard]
  }
];