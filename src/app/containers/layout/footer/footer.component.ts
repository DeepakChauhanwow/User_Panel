import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styles: [`
    .footerSection{
      padding:15px 0;
      margin-top:50px;
      background-color:#000;
    }
   .footerLinks{
      gap:20px;
      list-style: none;
   }
  .footerLinks li a{
    font-size:16px;
    color:#fff;
  }
    ul.breadcrumbIcon {
    display: flex;
    justify-content: end;
    margin: 0;
    padding: 0;
}
    .align-item-center{
      align-items:center;
    }
  
  `]
})
export class FooterComponent  {

}
