import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { DenyReasonConfirmDialogComponent } from './deny-reason-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable() export class DenyReasonConfirmDialogService {
    private subject = new Subject<any>();
    message:any;
    remove_deny_update = new Subject<any>();

    constructor(private dialog: MatDialog) { }

    confirmThis(message: string,sectionId:number,section, yesFn: () => void, noFn: () => void): any {
        const denyReasonDialog = this.dialog.open(DenyReasonConfirmDialogComponent, {           
            data: {
                type: 'confirm',
                text: message,
                sectionId: sectionId,
                section: section,
            },
            disableClose: true,
        });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
