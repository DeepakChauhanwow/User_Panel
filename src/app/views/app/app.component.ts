import { Component, OnInit, OnDestroy } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";
import { Subscription } from "rxjs";
import {
  SidebarService,
  ISidebar,
} from "src/app/containers/layout/sidebar/sidebar.service";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "app-app",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit, OnDestroy {
  sidebar: ISidebar;
  subscription: Subscription;

  bannerList: any;

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    center: true,
    dots: false,
    autoHeight: false,
    autoWidth: false,
    items: 1,
  };

  constructor(private sidebarService: SidebarService , private _commonService : CommonService) {}

  ngOnInit(): void {
    this.subscription = this.sidebarService.getSidebar().subscribe({
      next: (res: ISidebar) => {
        this.sidebar = res;
      },
      error: (err: any) => {
        console.error(`An error occurred: ${err.message}`);
      },
    });
    this.getBannerList();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getBannerList() {
    this._commonService.get_banner().then((res) => {
      console.log(res);
      this.bannerList = res.banners;
    });
  }
}
