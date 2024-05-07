import { Component, Inject, OnInit } from '@angular/core';
import { LanguageService } from '@core/services';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-message-info-dialog',
  templateUrl: './message-info-dialog.component.html',
  styleUrls: ['./message-info-dialog.component.css'],
})
export class MessageInfoDialogComponent implements OnInit {
  language: any;

  constructor(private lang: LanguageService, public dialogRef: MatDialogRef<MessageInfoDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.dialogRef.addPanelClass('message-info-dialog');
    this.language = this.lang.getLanguageFile();
  }
}
