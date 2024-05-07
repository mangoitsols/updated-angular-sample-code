import { Injectable } from '@angular/core';
import { MessaInfoDialogService } from '@shared/components/message-info-dialog/message-info-dialog.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService, private messageDialog: MessaInfoDialogService) {}

  showSuccess(message: string | undefined, title: string | undefined) {
    // this.toastr.success(message, title);
    this.messageDialog.openModal({
      title: title,
      message: message,
    });
  }

  showError(message: string | undefined, title: string | undefined) {
    // this.toastr.error(message, title);
    this.messageDialog.openModal({
      title: title,
      message: message,
    });
  }

  showInfo(message: string | undefined, title: string | undefined) {
    // this.toastr.info(message, title);
    this.messageDialog.openModal({
      title: title,
      message: message,
    });
  }

  showWarning(message: string | undefined, title: string | undefined) {
    // this.toastr.warning(message, title);
    this.messageDialog.openModal({
      title: title,
      message: message,
    });
  }
}
