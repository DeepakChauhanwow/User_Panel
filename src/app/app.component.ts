import { Component, OnInit, Renderer2, AfterViewInit, Injectable } from '@angular/core';
import { LangService } from './shared/lang.service';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';
import { Helper } from './shared/helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

@Injectable()
export class AppComponent implements OnInit, AfterViewInit {
  isMultiColorActive = environment.isMultiColorActive;
  isWhatsAppChat = environment.isWhatsAppChat;
  constructor(private langService: LangService, private renderer: Renderer2,private _authService:AuthService,private helper:Helper) {
    let newEncryptUserData = localStorage.getItem('newEncryptUserData');
    let userData = localStorage.getItem('userData');
    if(userData && (newEncryptUserData !== userData)){
      this.helper.user_details = null;
      localStorage.removeItem('newEncryptUserData');
      localStorage.removeItem('userData');
      localStorage.removeItem('device_token');
      this.helper.isUpadtedlocalStorage();
      this.helper._route.navigate(['/']);
      this._authService.loginSubject.next(null);
    }
  }

  ngOnInit(): void {
    this.langService.init();
    if (environment.isJivoChat) {
      this.loadJivoScript();
    }
  }

  loadJivoScript() {
    const script = document.createElement('script');
    script.src = '//code.jivosite.com/widget/Pun4lc0o4N';
    script.async = true;
    document.body.appendChild(script);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderer.addClass(document.body, 'show');
    }, 1000);
    setTimeout(() => {
      this.renderer.addClass(document.body, 'default-transition');
    }, 1500);
  }
}
