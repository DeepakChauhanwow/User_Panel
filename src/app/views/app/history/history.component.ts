import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HistoryModalComponent } from 'src/app/containers/pages/history-modal/history-modal.component';
import { HistoryService } from '../../../services/history.service'
import { Helper } from 'src/app/shared/helper';
import { NotifiyService } from 'src/app/services/notifier.service';
import { ExportHistoryModalComponent } from 'src/app/containers/pages/export-history-modal/export-history-modal.component';
import { EXPORT_HISTORY_TYPE } from 'src/app/constants/constants';
import { PaginationComponent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  is_field_mandatory_arr: any[] = [];
  @ViewChild('myTable') table: any;
  expanded: any = {};
  timeout: any;
  rows = [];
  itemsPerPage = 10;
  columns = [
    { prop: 'unique_id', name: 'Title' },
  ];
  temp = [...this.rows];
  history_info: any = [];
  unique_id: any;
  history_trips: any[] = [];
  trip_id: any;
  service: any;
  servicetype: any;
  card: any;
  cash_payment: any;
  rows1: any;
  name: any;
  item_bsRangeValue;
  start_date = null;
  end_date = null;
  currentPage = 1;
  total_page: number;
  sort_item: any
  sort_order: any
  search_item: any = undefined
  search_value: any = ''
  searchByList = [
    { label: 'label-title.id', value: 'unique_id' },
    { label: 'label-title.driver-name', value: 'first_name' },
  ];
  selectedSearchBy = { label: 'label-title.id', value: 'unique_id' };

  sortByList = [
    { label: 'label-title.id', value: 'unique_id' },
    { label: 'label-title.driver-name', value: 'first_name' },
  ];
  selectedSortBy = { label: 'label-title.id', value: 'unique_id' };

  sortByOrder = [
    { label: 'label-title.descending', value: -1 },
    { label: 'label-title.ascending', value: 1 },
  ];
  selectedSortOrderBy = { label: 'label-title.descending', value: -1 };
  is_clear_disabled: boolean = true;
  today_date: Date = new Date();
  created_date: Date;
  maxSize: number = 9;
  history_type: number;
  values: any = '';
  direction = localStorage.getItem('direction');

  @ViewChild(PaginationComponent) paginationComp!: PaginationComponent;
  @ViewChild('historyModal', { static: true }) historyModal: HistoryModalComponent;
  @ViewChild('ExportHistotyModel', { static: true }) ExportHistotyModel: ExportHistoryModalComponent;

  @HostListener('window:resize', ['$event']) onWindowResize() {
    const newMaxSize = window.innerWidth <= 768 ? 5 : 9;
    if (this.paginationComp.maxSize !== newMaxSize) {
      this.paginationComp.maxSize = newMaxSize;
      this.paginationComp.selectPage(this.paginationComp.page)
    }
  }

  constructor(private _historyService: HistoryService, public helper: Helper, private _notifierService: NotifiyService) { }

  ngOnDestroy(): void {
    this._notifierService = null;
  }

  ngOnInit(): void {
    this.history_type = this.helper.HISTORY_TYPE.NORMAL;
    this.helper.created_date.subscribe(data => {
      if (data) {
        let date = new Date(data)
        this.created_date = date;
      }
    })
    this.history_data();
  }

  showExportHistoryModal(): void {
    this.ExportHistotyModel.show(EXPORT_HISTORY_TYPE.HISTORY, this.helper.user_details._id);
  }

  history_data() {
    let json: any = { user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, start_date: this.start_date, end_date: this.end_date, page: this.currentPage, sort_item: [this.sort_item, this.sort_order], search_item: this.search_item, search_value: this.search_value, is_export: false }

    if(this.history_type == this.helper.HISTORY_TYPE.NORMAL){
      this._historyService.get_history(json).then(res_data => {
        this.rows = res_data.trips;
        this.total_page = res_data.pages
      })
    }
    if(this.history_type == this.helper.HISTORY_TYPE.OPEN_RIDE){
      this._historyService.openrideuserhistory(json).then(res_data => {
        this.rows = res_data.trips;
        this.total_page = res_data.pages
      })
    }
  }

  updateFilter(event): void {
    const val = event.target.value.toLowerCase().trim();
    const count = this.columns.length;
    const keys = Object.keys(this.temp[0]);
    const temp = this.temp.filter(item => {
      for (let i = 0; i < count; i++) {
        if ((item[keys[i]] && item[keys[i]].toString().toLowerCase().indexOf(val) !== -1) || !val) {
          return true;
        }
      }
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  showAddNewModal(trip_detail): void {
    this.historyModal.show(trip_detail._id, 1,this.history_type);
  }

  changeSearchBy(event) {
    this.selectedSearchBy = event;
    this.is_clear_disabled = false;
  }

  changeSortBy(event) {
    this.selectedSortBy = event
    this.is_clear_disabled = false;
  }

  changeSortOrderBy(event) {
    this.selectedSortOrderBy = event;
    this.is_clear_disabled = false;
  }

  pageChanged(event) {
    this.currentPage = event.page;
    this.history_data();
  }

  applyFilter() {
    if (this.item_bsRangeValue?.length) {
      this.is_clear_disabled = false;
      this.start_date = this.item_bsRangeValue[0];
      this.end_date = this.item_bsRangeValue[1];
    }
    this.sort_order = this.selectedSortOrderBy.value
    this.sort_item = this.selectedSortBy.value
    this.search_item = this.selectedSearchBy.value
    this.search_value = this.values
    this.currentPage = 1;
    this.history_data();
  }

  clear() {
    this.item_bsRangeValue = [];
    this.start_date = '';
    this.end_date = '';
    this.currentPage = 1;
    this.values = '';
    this.search_value = '';
    this.search_item = undefined;
    this.sort_item = null;
    this.sort_order = null;
    this.selectedSearchBy = { label: 'label-title.id', value: 'unique_id' };
    this.selectedSortBy = { label: 'label-title.id', value: 'unique_id' };
    this.selectedSortOrderBy = { label: 'label-title.descending', value: -1 };
    this.history_data();
    this.is_clear_disabled = true;
  }

  excel() {
    if (this.rows.length == 0) {
      this._notifierService.showNotification('error', this.helper.trans.instant('label-title.no-record-found'));
      return;
    }
    if (this.item_bsRangeValue?.length) {
      this.start_date = this.item_bsRangeValue[0];
      this.end_date = this.item_bsRangeValue[1];
    }
    this.sort_order = this.selectedSortOrderBy.value
    this.sort_item = this.selectedSortBy.value
    this.search_item = this.selectedSearchBy.value
    this.search_value = this.values
    this.currentPage = 1;
    let header = {
      id: this.helper.trans.instant('heading-title.trip-id'),
      user_id: this.helper.trans.instant('label-title.user-id'),
      user: this.helper.trans.instant('heading-title.user'),
      driver_id: this.helper.trans.instant('label-title.driver-id'),
      driver: this.helper.trans.instant('heading-title.driver'),
      date: this.helper.trans.instant('heading-title.date'),
      status: this.helper.trans.instant('heading-title.status'),
      amount: this.helper.trans.instant('heading-title.price'),
      payment: this.helper.trans.instant('heading-title.payment'),
      payment_status: this.helper.trans.instant('heading-title.payment-status'),
      title_trip_status_completed: this.helper.trans.instant('label-title.completed'),
      title_trip_status_cancelled: this.helper.trans.instant('label-title.cancel'),
      title_status_cancel_by_user: this.helper.trans.instant('label-title.cancel-by-user'),
      title_status_cancel_by_provider: this.helper.trans.instant('label-title.cancel-by-provider'),
      title_pay_by_cash: this.helper.trans.instant('label-title.by-cash'),
      title_pay_by_card: this.helper.trans.instant('label-title.by-card'),
      title_pending: this.helper.trans.instant('label-title.pending'),
      title_paid: this.helper.trans.instant('label-title.paid'),
      title_trip_status_coming: this.helper.trans.instant('label-title.coming'),
      title_trip_status_arrived: this.helper.trans.instant('label-title.arrived'),
      title_trip_status_trip_started: this.helper.trans.instant('label-title.started'),
      title_trip_status_accepted: this.helper.trans.instant('label-title.accepted'),
      title_trip_status_waiting: this.helper.trans.instant('label-title.waiting'),
      title_not_paid: this.helper.trans.instant('label-title.not-paid'),
      title_total_cancelled: this.helper.trans.instant('label-title.cancelled'),
    }
    let json: any = { header: header, user_id: this.helper.user_details._id, token: this.helper.user_details.server_token, start_date: this.start_date, end_date: this.end_date, page: this.currentPage, sort_item: [this.sort_item, this.sort_order], search_item: this.search_item, search_value: this.search_value, is_export: true, export_user_id: this.helper.user_details._id }

    if(this.history_type == this.helper.HISTORY_TYPE.NORMAL){
      this._historyService.get_history(json).then(res => {
        if (res) {
          this._notifierService.showNotification('success', this.helper.trans.instant('alert.exported-success'));
          setTimeout(() => {
            this.showExportHistoryModal()
          }, 500);
        }
      })
    }
    if(this.history_type == this.helper.HISTORY_TYPE.OPEN_RIDE){
      this._historyService.openrideuserhistory(json).then(res => {
        if (res) {
          this._notifierService.showNotification('success', this.helper.trans.instant('alert.exported-success'));
          setTimeout(() => {
            this.showExportHistoryModal()
          }, 500);
        }
      })
    }
  }

  onSort(item) {
    if (item === this.sort_item) {
      if (this.sort_order === -1) {
        this.sort_order = 1
      } else {
        this.sort_order = -1
      }
    } else {
      this.sort_item = item
      this.sort_order = 1
    }
    this.search_item = 'unique_id';
    this.selectedSearchBy = { label: 'label-title.id', value: 'unique_id' };
    this.history_data();
  }

  onHistoryTabChange(tab_no){
    this.history_type = tab_no;
    this.history_data();
  }

}
