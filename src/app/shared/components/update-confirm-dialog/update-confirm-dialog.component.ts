import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmDialogComponent, UpdateConfirmDialogService } from '@shared/components';
import { LanguageService } from '@core/services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-update-confirm-dialog',
    templateUrl: 'update-confirm-dialog.component.html',
    styleUrls: ['update-confirm-dialog.component.scss']
})

export class UpdateConfirmDialogComponent implements OnInit {
    language: any;
    message: any;
    updateForm: UntypedFormGroup;

    constructor(
        private updateConfirmDialogService: UpdateConfirmDialogService,
        private lang: LanguageService, public formBuilder: UntypedFormBuilder,
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { this.message = data }

    ngOnInit(): any {
        this.updateForm = this.formBuilder.group({
            reason: ['', Validators.required]
        });

        this.language = this.lang.getLanguageFile();
        this.updateConfirmDialogService.getMessage().subscribe(message => {
            this.message = message;
        });        
    }

    close(val: any) {
        this.dialogRef.close(val);
    }
}
