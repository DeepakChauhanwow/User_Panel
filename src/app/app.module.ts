import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { ViewsModule } from './views/views.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { LayoutContainersModule } from './containers/layout/layout.containers.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ResInterceptInterceptor } from './interceptor/res-intercept.interceptor';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker'
import { RecaptchaModule, RecaptchaV3Module, RecaptchaFormsModule } from "ng-recaptcha";
import { CommonService } from './services/common.service';
import { Helper } from './shared/helper';

function load(config: CommonService, helper: Helper): () => Promise<boolean> {
  return async () => {
    try {
      helper.helper_is_loading = true;
      await config._initApp();
      helper.helper_is_loading = false;
      return true;
    } catch (err) {
      helper.helper_is_loading = true;
      return false;
    }
  };
}

@NgModule({
  imports: [
    BrowserModule,
    ViewsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    LayoutContainersModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
    }),
    ServiceWorkerModule.register('../ngsw-worker.js', { enabled: environment.production }),
    RecaptchaV3Module,
		RecaptchaModule,
		RecaptchaFormsModule,
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResInterceptInterceptor,
      multi: true

    },
    SwPush,
    {
			provide: APP_INITIALIZER,
			useFactory: load,
			deps: [CommonService,Helper],
			multi: true
		},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
