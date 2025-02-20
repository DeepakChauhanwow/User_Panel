import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Helper } from 'src/app/shared/helper';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  constructor(public _apiService:ApiService,public _helper:Helper) { }


}
