import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewRoutingModule } from './views.routing';
import { SharedModule } from '../shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeadroomModule } from '@ctrl/ngx-headroom';
import { HomeComponent } from './home/home.component';
import { PrivacyTermsComponent } from './privacy-terms/privacy-terms.component';
import { PagesContainersModule } from "../containers/pages/pages.containers.module";
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { LoaderModule } from '../components/loader/loader.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
@NgModule({
    declarations: [HomeComponent, PrivacyTermsComponent],
    providers: [],
    imports: [
        BsDropdownModule.forRoot(),
        CommonModule,
        ViewRoutingModule,
        SharedModule,
        TabsModule.forRoot(),
        BrowserAnimationsModule,
        HeadroomModule,
        PagesContainersModule ,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule,
        NgxMaterialTimepickerModule,
        LoaderModule,
        CarouselModule 
    ]
})
export class ViewsModule {}
