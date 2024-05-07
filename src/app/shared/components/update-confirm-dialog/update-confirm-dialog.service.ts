import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { UpdateConfirmDialogComponent } from './update-confirm-dialog.component';

@Injectable() export class UpdateConfirmDialogService {
    private subject = new Subject<any>();
    message: any;
    denyDialogResponse = new Subject<any>();

    constructor(private dialog: MatDialog) { }

    confirmThis(message: string, yesFn: (result: any) => void, noFn: () => void, isAction?: any): any {
        const updateDialog = this.dialog.open(UpdateConfirmDialogComponent, {           
            data: {
                type: 'confirm',
                text: message,
            },
            disableClose: true,
        });
        updateDialog.afterClosed().subscribe(result => {
            if (result) {
                yesFn(result);
            } else {
                noFn();
            }
        });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
