import {CanActivate,Router,ActivatedRouteSnapshot,RouterStateSnapshot,CanActivateChild,UrlTree,} from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  permissions: Array<any>;
  is_free_trial_expire: boolean = false;
  is_payment_fail: boolean = false;

  constructor(private authService: AuthService,private router:Router) { }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree>  {     
    return new Promise((resolve,rejects)=>{
        if(this.authService.isAuthenticated){
            resolve(true);
        }else{
            resolve(this.router.parseUrl('/'));
        }
    })
}

async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    return new Promise((resolve,rejects)=>{
        if(this.authService.isAuthenticated){

            resolve(true);  
        }else{      

            resolve(this.router.parseUrl('/')); 

        }
    })
  }


}
