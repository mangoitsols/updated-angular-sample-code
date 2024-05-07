import { Component, Inject, OnInit } from '@angular/core';
import { LanguageService } from '@core/services';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: 'confirm-dialog.component.html',
  styleUrls: ['confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {
  language: any;

  constructor(private lang: LanguageService, public dialogRef: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): any {
    this.language = this.lang.getLanguageFile();
    this.dialogRef.addPanelClass('confirmation-dialog-box');
  }

  close(val: any) {
    this.dialogRef.close(val);
  }
}
