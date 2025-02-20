import { Helper } from '../../../shared/helper';
import { CommonService } from 'src/app/services/common.service';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-export-history-modal',
  templateUrl: './export-history-modal.component.html',
  styleUrls: ['./export-history-modal.component.scss']
})
export class ExportHistoryModalComponent {
  modalRef: BsModalRef;
  confirmModelRef: BsModalRef;
  user_id: any;
  type: any;
  requestList: any;
  listData: any;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-right'
  };
  confirmationModalConfig = {
    backdrop: true,
    ignoreBackdropClick: true,
  }
  timezone_for_display_date: string = '';
  exportHistoryObservable: Subscription;
  id: any;

  @ViewChild('template', { static: true }) template: TemplateRef<any>;
  @ViewChild('confirmationTemplate', { static: true }) confirmationTemplate: TemplateRef<any>;

  constructor(private modalService: BsModalService, private commonService: CommonService, public _helper: Helper) { }

  show(type,export_user_id): void {
    let json: any = { type: type, export_user_id: export_user_id }
    this.commonService.getExportHistoryList(json).then((res_data: any) => {
      this.listData = res_data.export_history_data;
      this.listData?.reverse();
      this.modalRef = this.modalService.show(this.template, this.config);
    })
    this.exportHistoryObservable = this.commonService.__exportChangesObservable.subscribe((data) => {
      this.commonService.getExportHistoryList(json).then((res_data: any) => {
        this.listData = res_data.export_history_data;
        this.listData?.reverse();
      })
    })
  }

  onDelete(id) {
    this.id = id;
    this.confirmModelRef = this.modalService.show(this.confirmationTemplate, this.confirmationModalConfig);
    this.onClose();
  }

  cancel() {
    this.confirmModelRef.hide()
  }

  confirm() {
    this.commonService.deleteExportFile({id: this.id}).then((res_data : any )=>{
      if(res_data.success){
        this.cancel();
      }
    })
  }

  onClose() {
    this.modalRef.hide();
  }

}
