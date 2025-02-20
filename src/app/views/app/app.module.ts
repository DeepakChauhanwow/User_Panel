import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutContainersModule } from 'src/app/containers/layout/layout.containers.module';
import { ProfileComponent } from './profile/profile.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { HistoryComponent } from './history/history.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BookTripComponent } from './book-trip/book-trip.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { RatingModule } from 'ngx-bootstrap/rating';
import { PagesContainersModule } from 'src/app/containers/pages/pages.containers.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderModule } from '../../components/loader/loader.module'
import { TranslateModule } from '@ngx-translate/core';
import { FutureRequestsComponent } from './future-requests/future-requests.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {PipeModule} from '../../pipe/pipe.module';
import { NgxPayPalModule } from 'ngx-paypal';
import { NotificationComponent } from './notification/notification.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CarouselModule as OwlCarouselModule } from 'ngx-owl-carousel-o';
import { CarouselModule as BootstrapCarouselModule } from 'ngx-bootstrap/carousel';

@NgModule({
  declarations: [AppComponent, ProfileComponent, HistoryComponent, BookTripComponent, FutureRequestsComponent, NotificationComponent],
  imports: [
    LoaderModule,
    CommonModule,
    AppRoutingModule,
    PagesContainersModule,
    SharedModule,
    LayoutContainersModule,
    CollapseModule,
    ReactiveFormsModule,
    FormsModule,
    PipeModule ,
    NgxMaterialTimepickerModule,
    BsDropdownModule.forRoot(),
    RatingModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TranslateModule,
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    NgxPayPalModule,
    TooltipModule.forRoot(),
    OwlCarouselModule,
    BootstrapCarouselModule.forRoot()
  ]
})
export class AppModule { }

