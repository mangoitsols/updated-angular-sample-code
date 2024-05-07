import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable()
export class ConfirmDialogService {
  dialogResponse = new Subject<any>();
  private subject = new Subject<any>();

  constructor(private dialog: MatDialog) {}

  confirmThis(message: string, yesFn: () => void, noFn: () => void, isAction?: any): any {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        type: 'confirm',
        text: message,
      },
      disableClose: true,
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        yesFn();
        return result;
      } else {
        noFn();
        return false;
      }
    });
  }

  // getMessage(): Observable<any> {
  //     return this.subject.asObservable();
  // }
}
