import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { LayoutContainersModule } from '../layout/layout.containers.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { RatingModule } from 'ngx-bootstrap/rating';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { HistoryModalComponent } from './history-modal/history-modal.component';
import { ProfileEditModalComponent } from './profile-edit-modal/profile-edit-modal.component';
import { WalletHistoryModalComponent } from './wallet-history-modal/wallet-history-modal.component';
import { DocumentEditModalComponent } from './document-edit-modal/document-edit-modal.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { NouisliderModule } from 'ng2-nouislider';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FilterPipe } from 'src/app/pipe/search-pipe/filter.pipe'

import { FutureRequestDetailsModalComponent } from './future-request-details-modal/future-request-details-modal.component';
import { RegisterAddressModelComponent } from './register-address-model/register-address-model.component';
import { ExportHistoryModalComponent } from './export-history-modal/export-history-modal.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { ComponentsStateButtonModule } from 'src/app/components/state-button/components.state-button.module';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { TrackTripComponent } from './track-trip/track-trip.component';

@NgModule({
  declarations: [
    HistoryModalComponent,
    ProfileEditModalComponent,
    WalletHistoryModalComponent,
    DocumentEditModalComponent,
    AuthModalComponent,
    FutureRequestDetailsModalComponent,
    FilterPipe,
    RegisterAddressModelComponent,
    ExportHistoryModalComponent,
    TrackTripComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    CollapseModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutContainersModule,
    NgSelectModule,
    LightboxModule,
    BsDatepickerModule.forRoot(),
    RatingModule.forRoot(),
    TimepickerModule.forRoot(),
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    DropzoneModule,
    NouisliderModule,
    TranslateModule,
    NgxPayPalModule,
    ComponentsStateButtonModule,
    DirectivesModule
  ],
  exports: [
    HistoryModalComponent,
    ProfileEditModalComponent,
    WalletHistoryModalComponent,
    DocumentEditModalComponent,
    AuthModalComponent,
    FutureRequestDetailsModalComponent,
    RegisterAddressModelComponent,
    ExportHistoryModalComponent
  ]
})
export class PagesContainersModule { }
