import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ColorSwitcherComponent } from './color-switcher/color-switcher.component';
import { FooterComponent } from './footer/footer.component';
import { HeadingComponent } from './heading/heading.component';
import { ApplicationMenuComponent } from './application-menu/application-menu.component';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { Topnav2Component } from './topnav2/topnav2.component';
import { AddcardModalComponent } from '../pages/addcard-modal/addcard-modal.component';
import { NgxPayPalModule } from 'ngx-paypal';

@NgModule({
  declarations: [
    SidebarComponent,
    BreadcrumbComponent,
    ColorSwitcherComponent,
    FooterComponent,
    HeadingComponent,
    ApplicationMenuComponent,
    Topnav2Component,
    AddcardModalComponent
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    TranslateModule,
    RouterModule,
    CollapseModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    NgxPayPalModule
  ],
  exports: [
    SidebarComponent,
    BreadcrumbComponent,
    ColorSwitcherComponent,
    FooterComponent,
    HeadingComponent,
    ApplicationMenuComponent,
    Topnav2Component,
    AddcardModalComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class LayoutContainersModule { }
