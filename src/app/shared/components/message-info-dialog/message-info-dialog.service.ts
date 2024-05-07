import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { MessageInfoDialogComponent } from './message-info-dialog.component';

@Injectable()
export class MessaInfoDialogService {
  constructor(private dialog: MatDialog) {}

  openModal(data: any): any {
    let className = this.getDialogClass(data.title);

    const confirmDialog = this.dialog.open(MessageInfoDialogComponent, {
      data,
      disableClose: true,
      backdropClass: 'backdropBackground',
      panelClass: className,
    });

    if (data?.title === 'Success') {
      setTimeout(() => {
        confirmDialog.close();
      }, 3000);
    }

    confirmDialog.backdropClick().subscribe(() => {
      confirmDialog.close(); // Close the dialog when backdrop (outside the dialog) is clicked
    });
    return confirmDialog.afterClosed();
  }

  private getDialogClass(title: string): string {
    switch (title?.toLowerCase()) {
      case 'success':
        return 'success-body';
      case 'error':
        return 'error-body';
      case 'information':
        return 'information-body';
      case 'warning':
        return 'warning-body';
      default:
        return ''; // You can provide a default class or an empty string based on your design
    }
  }
}
