import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './home/home.component';
import { UserRole } from '../shared/auth.roles';
import { PrivacyTermsComponent } from './privacy-terms/privacy-terms.component';
import { TrackTripComponent } from '../containers/pages/track-trip/track-trip.component';
import { DeleteinfoComponent } from './deleteinfo/deleteinfo.component';

const adminRoot = environment.adminRoot.substring(1); // path cannot start with a slash

let routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path:'deleteinfo',
    component:DeleteinfoComponent,
  },
  {
    path: 'legal/:type',
    component: PrivacyTermsComponent,
  },
  {
    path : "track-trip",
    component: TrackTripComponent
  },
  {
    path: adminRoot,
    loadChildren: () => import('./app/app.module').then((m) => m.AppModule),
    data: { roles: [UserRole.Admin, UserRole.Editor] },
  },
  { path: '**', redirectTo: '/' },
];

if (!environment.isAuthGuardActive) {
  routes = [
    {
      path: '',
      component: HomeComponent,
      pathMatch: 'full',
    },
    {
      path: 'app',
      loadChildren: () => import('./app/app.module').then((m) => m.AppModule),
    },
    {
      path: 'user',
      loadChildren: () =>
        import('./user/user.module').then((m) => m.UserModule),
    },
    { path: 'error', component: ErrorComponent },
    { path: '**', redirectTo: '/' },
  ];
}
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewRoutingModule { }
