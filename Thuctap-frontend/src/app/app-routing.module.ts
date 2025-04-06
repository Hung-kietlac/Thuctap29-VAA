import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { PhimManagementComponent } from './pages/admin/phim-management/phim-management.component';
import { SuatChieuManagementComponent } from './pages/admin/suatchieu-management/suatchieu-management.component';
import { VeManagementComponent } from './pages/admin/ve-management/ve-management.component';
import { DichVuManagementComponent } from './pages/admin/dichvu-management/dichvu-management.component';

const routes: Routes = [
  // ... các routes khác
  {
    path: 'admin',
    component: AdminDashboardComponent
  },
  {
    path: 'admin/phim',
    component: PhimManagementComponent
  },
  {
    path: 'admin/suatchieu',
    component: SuatChieuManagementComponent
  },
  {
    path: 'admin/ve',
    component: VeManagementComponent
  },
  {
    path: 'admin/dichvu',
    component: DichVuManagementComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { } 