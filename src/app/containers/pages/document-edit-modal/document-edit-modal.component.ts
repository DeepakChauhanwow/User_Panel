import { Component, EventEmitter, HostListener, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { DEFAULT_IMAGE, PDFSIZE } from 'src/app/constants/constants';
import { DocumentService } from 'src/app/services/document.service';
import { DocumentModel } from 'src/app/models/document.model';
import { Helper } from 'src/app/shared/helper';
import { NotifiyService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-document-edit-modal',
  templateUrl: './document-edit-modal.component.html',
  styleUrls: ['./document-edit-modal.component.scss']
})
export class DocumentEditModalComponent {
  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-right',
    // keyboard: false
  };
  IMAGE_URL = environment.IMAGE_URL;
  DEFAULT_USER_PROFILE = DEFAULT_IMAGE.DOCUMENT_PROFILE;
  profile_image: any = this.DEFAULT_USER_PROFILE;
  image_type: number;
  uploadDocument: Blob;
  selectedDocumentIndex: any;
  UserDocument: DocumentModel;
  todayDate: Date = new Date();
  is_edit: boolean = false;
  is_image_uploaded: boolean = false;

  @Output() documentHandler: EventEmitter<any> = new EventEmitter();
  @ViewChild('template', { static: true }) template: TemplateRef<any>;

  constructor(private modalService: BsModalService, public _documentService: DocumentService, public _helper: Helper, private _notifierService: NotifiyService) { }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      if (this.modalRef) {
        this.modalRef.onHidden.subscribe(() => {
          this.is_image_uploaded = false;
          this.is_edit = false;
        })
      }
    }
  }

  show(): void {
    this.modalRef = this.modalService.show(this.template, this.config);
    this.fetchDocument()
  }

  childToParentClick() {
    this.documentHandler.emit();
  }

  onSelectImageFile(event, type) {
    this.image_type = type
    let files = event.target.files;
    if (files.length === 0)
      return;
    const mimeType = files[0].type;
    if (mimeType.includes('pdf') && files[0].size > PDFSIZE) {
      this._notifierService.showNotification('error', this._helper.trans.instant('validation-title.document-size'));
      return;
    }
    let fileType = this._helper.uploadDocFile.filter((element) => {
      return mimeType == element;
    })

    if (mimeType != fileType) {
      this._notifierService.showNotification('error', this._helper.trans.instant('validation-title.invalid-document-format'));
      return;
    }

    if (mimeType == 'application/pdf') {
      this.uploadDocument = files[0];
      const reader1 = new FileReader();
      reader1.readAsDataURL(files[0]);
      reader1.onload = (_event) => {
        this.UserDocument[this.selectedDocumentIndex].document_picture = DEFAULT_IMAGE.DEFAULT_PDF_IMG
      }
    } else {
      this.uploadImage(files[0])
    }
  }

  uploadImage(event) {
    this.uploadDocument = event;
    const reader = new FileReader();
    reader.readAsDataURL(event);
    reader.onload = (_event) => {
      this.UserDocument[this.selectedDocumentIndex].document_picture = reader.result
    }
  }

  onDownload(image_url, docName) {
    let split_image_url = image_url.split(this.IMAGE_URL)
    if (split_image_url[1] != '') {
      // window.open(image_url)
    }
    this._helper.downloadUrl(image_url)
      .subscribe({
        next: imgData => {
          this._helper.downloadImage(imgData, docName);
        },
        error: err => console.error(err)
      });
  }

  onEdit(document, i) {
    this.is_edit = true;
    this.selectedDocumentIndex = i
    document.is_edit = true;
    if (this.UserDocument[i].option == 1 && this.UserDocument[i].document_picture == this.IMAGE_URL) {
      this.is_image_uploaded = true;
    }
  }

  fetchDocument() {
    let json: any = { server_token: this._helper.user_details.server_token, user_id: this._helper.user_details._id }
    this._documentService.fetch_document(json).then((user_document) => {
      if (user_document != null) {
        this.UserDocument = user_document.userdocument;
        user_document.userdocument.forEach(document => {
          document.document_picture = this.IMAGE_URL + document.document_picture;
        })
      }
    })
  }

  updateDocument(data: any) {
    data.is_update_clicked = true;
    if ((data.is_expired_date && !data.expired_date) || (data.is_unique_code && !data.unique_code)) {
      return
    }
    let expiry_date: any;
    if (data.expired_date) {
      data.expired_date = new Date(data.expired_date).setHours(23, 59, 59, 59);
      const secs = new Date(data.expired_date).getTime()
      expiry_date = new Date(secs).toUTCString()
    }
    let documentsForm = new FormData();
    documentsForm.append('user_id', this._helper.user_details._id);
    documentsForm.append('token', this._helper.user_details.server_token);
    documentsForm.append('expired_date', expiry_date || "");
    documentsForm.append('unique_code', data.unique_code || "");
    documentsForm.append('pictureData', this.uploadDocument || "");
    documentsForm.append('document_id', data._id);
    if (this.is_image_uploaded === true) {
      if (!this.uploadDocument) {
        this._notifierService.showNotification('error', this._helper.trans.instant('validation-title.please_upload_image'));
        return;
      }
    }
    if (this.uploadDocument || data.expired_date || data.unique_code) {
      this._documentService.update_document(documentsForm).then(is_update => {
        if (is_update) {
          this.childToParentClick();
          data.is_edit = false;
          this.fetchDocument();
        }
        this.uploadDocument = null;
      })
    } else {
      if (this.UserDocument[this.selectedDocumentIndex].document_picture !== this.IMAGE_URL) {
        data.is_edit = false;
        this.is_edit = false;
        this.is_image_uploaded = false;
        return;
      }
      this._notifierService.showNotification('error', this._helper.trans.instant('validation-title.please_upload_image'));
      return;
    }
    this.is_edit = false;
    this.is_image_uploaded = false;
  }

  documentModalClose() {
    this.is_image_uploaded = false;
    this.is_edit = false;
    this.modalRef.hide();
  }
}
