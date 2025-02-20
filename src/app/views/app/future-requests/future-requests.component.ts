import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Helper } from 'src/app/shared/helper';
import { FutureRequestDetailsModalComponent } from '../../../containers/pages/future-request-details-modal/future-request-details-modal.component';
import { HistoryService } from '../../../services/history.service';
import { SocketService } from 'src/app/services/socket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-future-requests',
  templateUrl: './future-requests.component.html',
  styleUrls: ['./future-requests.component.scss']
})
export class FutureRequestsComponent implements OnInit,OnDestroy {
  is_field_mandatory_arr: any[] = [];
  expanded: any = {};
  timeout: any;
  rows = [];
  itemsPerPage = 9;
  columns = [
    { prop: 'unique_id', name: 'Title' },
  ]
  temp = [...this.rows];
  unique_id: any = [];
  history_trips: any[] = [];
  runninghistoryModal: any;
  token: any;
  history_type: number;
  
  @ViewChild('myTable') table: any;
  @ViewChild('runninghistoryModal', { static: true }) runningrequestModal: FutureRequestDetailsModalComponent;

  constructor( private _socket: SocketService,private _historyService: HistoryService, public helper: Helper,private route: ActivatedRoute,) { }

  ngOnDestroy() {
    const urlTree = this.removeQueryParams(window.location.href, ['future_history_type']);
    window.history.replaceState({}, '', urlTree.toString());
  }

  removeQueryParams(url: string, paramsToRemove: string[]): URL {
    const urlObj = new URL(url);
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj;
  }

  ngOnInit(): void {
    const urlTree = this.removeQueryParams(window.location.href, ['future_history_type']);
    window.history.replaceState({}, '', urlTree.toString());
    this.route.queryParams.subscribe((params:any) => {
      if(Object.keys(params).length != 0){
        this.history_type = params?.future_history_type;
        this.history_data();
      }else{
        this.history_type = this.helper.HISTORY_TYPE.NORMAL;
        this.history_data();
      }
    });
    this.socket(this.helper.user_details._id)
  }
  
  socket(id: any) {
    let listner = id
    this._socket.listener(listner).subscribe((res: any) => {
      if(res){
        this.history_data()
      }
    })
  }

  history_data() {
    let is_open_ride;
    switch (Number(this.history_type)) {
      case this.helper.HISTORY_TYPE.NORMAL:
        is_open_ride = false;
        break;
      case this.helper.HISTORY_TYPE.OPEN_RIDE:
        is_open_ride = true;
        break;
    }
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, is_open_ride: is_open_ride }
    this._historyService.get_getfuture_history(json).then(res_data => {
      this.rows = res_data.scheduledtrip;
    })
  }

  showModal(trip): void {
      this.runningrequestModal.show(trip);
  }

  onHistoryTabChange(tab_no){
    this.history_type = tab_no;
    this.history_data();
  }

}
