import { NotificationComponent } from './notification/notification.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { BookTripComponent } from './book-trip/book-trip.component';
import { HistoryComponent } from './history/history.component';
import { ProfileComponent } from './profile/profile.component';
import { AboutComponent } from './about/about.component';

// import { AboutComponent } from './about/abo';

import { FutureRequestsComponent } from './future-requests/future-requests.component';

const routes: Routes = [
    {
        path: '', component: AppComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: '/' },
            { path: 'profile', component: ProfileComponent },
            { path: 'history', component: HistoryComponent },
            { path: 'future-requests', component: FutureRequestsComponent },
            { path: 'create-trip', component: BookTripComponent },
            { path: 'notification', component: NotificationComponent },
            { path: 'about', component: AboutComponent },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
