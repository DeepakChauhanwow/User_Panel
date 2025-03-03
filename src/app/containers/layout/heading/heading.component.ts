import { Component, Input } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import menuItems, { IMenuItem } from 'src/app/constants/menu';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-heading',
  templateUrl: './heading.component.html'
})
export class HeadingComponent {
  @Input() title = '';
  menuItems: IMenuItem[] = menuItems;
  path = '';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      })
    ).subscribe((event) => {
     this.path = this.router.url.split('?')[0];
    });
  }

  getLabel(path): string {
    if (path === environment.adminRoot) {
      return 'menu.home';
    }

    // step 0
    let foundedMenuItem = this.menuItems.find(x => x.to === path);

    if (!foundedMenuItem) {
      // step 1
      this.menuItems.forEach(menu => {
        if (!foundedMenuItem && menu.subs) {foundedMenuItem = menu.subs.find(x => x.to === path); }
      });
      if (!foundedMenuItem) {
        // step 2
        this.menuItems.forEach(menu => {
          if (menu.subs) {
            menu.subs.forEach(sub => {
                if (!foundedMenuItem && sub.subs) {foundedMenuItem = sub.subs.find(x => x.to === path); }
              });
          }
        });
        if (!foundedMenuItem) {
          // step 3
          this.menuItems.forEach(menu => {
            if (menu.subs) {
              menu.subs.forEach(sub => {
                if (sub.subs) {
                  sub.subs.forEach(deepSub => {
                    if (!foundedMenuItem && deepSub.subs) {foundedMenuItem = deepSub.subs.find(x => x.to === path); }
                  });
                }
              });
            }
          });
        }
      }
    }

    if (foundedMenuItem) { return foundedMenuItem.label; } else { return 'notFoundInMenu'; }
  }

}
