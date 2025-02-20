import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Helper } from 'src/app/shared/helper';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';

export class AdminDetail {
  admin_phone: number;
  contactUsEmail: string;
  android_client_app_url: string;
  ios_client_app_url: string;
}
@Component({
  selector: 'app-privacy-terms',
  templateUrl: './privacy-terms.component.html',
  styleUrls: ['./privacy-terms.component.scss']
})
export class PrivacyTermsComponent implements OnInit {

  IMAGE_URL = environment.IMAGE_URL;
  current_year: number;
  html_content: any;
  type: string;
  admin_detail:AdminDetail = new AdminDetail();
  darkTheme = localStorage.getItem("vien-themecolor");
  logoClr: boolean = false;

  constructor(public helper: Helper, private _commonService: CommonService,private route: ActivatedRoute) { }
  showMobileMenu = false;
  ngOnInit(): void {
    if (this.darkTheme.startsWith("dark")) {
      this.logoClr = true;
    }
    this.privacy_terms();
    let date = new Date();
    this.current_year = date.getFullYear();
    this._commonService.get_setting_detail({}).then((setting_detail) => {
      this.admin_detail=setting_detail.setting_detail;
    })
  }

  privacy_terms() {
    this.type = this.route.snapshot.paramMap.get('type');
    let json: {};
    this._commonService.privacyPolicy(json).then((res_data) => {
      if(res_data.success){
        switch (this.type) {
          case "user-privacy-policy":
            this.html_content = res_data.user_privacy_policy;
            break;
          case "user-terms-conditions":
            this.html_content = res_data.user_terms_and_condition;
            break;
          case "delete-account-policy":
            this.html_content = res_data.user_delete_policy;
            break;
          default:
            break;
        }
      }
    })
  }


}
