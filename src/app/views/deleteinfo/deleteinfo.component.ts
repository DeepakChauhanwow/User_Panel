import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-deleteinfo',
  standalone: true,
  imports: [],
  templateUrl: './deleteinfo.component.html',
  styleUrls: ['./deleteinfo.component.scss']
})
export class DeleteinfoComponent {
  IMAGE_URL = environment.IMAGE_URL;
}
