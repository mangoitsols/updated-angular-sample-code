import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoginDetails } from '@core/models';
import { AuthService, LanguageService, NotificationService } from '@core/services';

@Component({
  selector: 'app-tags-add-edit',
  templateUrl: './tags-add-edit.component.html',
  styleUrls: ['./tags-add-edit.component.css'],
})
export class TagsAddEditComponent implements OnInit {
  userData: LoginDetails;
  language: any;
  addTagForm: FormGroup;
  editTagForm: FormGroup;
  isAddSubmitted: any = false;
  isEditSubmitted: any = false;

  constructor(
    private lang: LanguageService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TagsAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationService: NotificationService
  ) {
    this.addTagForm = this.formBuilder.group({
      tag_name: ['', Validators.required],
      type: [this.data.type],
    });

    this.editTagForm = this.formBuilder.group({
      tag_name: [this.data.tag_name, Validators.required],
      type: [this.data.type],
    });
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
  }

  get formControls() {
    return this.addTagForm.controls;
  }

  get f() {
    return this.editTagForm.controls;
  }

  onSubmitAdd() {
    this.isAddSubmitted = true;
    this.authService.setLoader(true);
    if (this.addTagForm.valid) {
      this.authService.memberSendRequest('post', 'createTag', this.addTagForm.value).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.isAddSubmitted = false;
        this.dialogRef.close(true);

        if (respData?.isError == false) {
          this.notificationService.showError(respData['result']['message'], 'Success');
        } else if (respData?.isError == true) {
          this.notificationService.showError(respData['result']['message'], 'Error');
        }
      });
    } else {
      this.authService.setLoader(false);
    }
  }

  onSubmitEdit() {
    if (this.editTagForm.valid) {
      this.authService.memberSendRequest('put', 'updateTag/' + this.data.id, this.editTagForm.value).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.isAddSubmitted = false;
        this.dialogRef.close(true);

        if (respData['result']['message'] && respData['isError'] == true) {
          this.notificationService.showError(respData['result']['message'], 'Error');
        } else if (respData['result']['message'] && respData['isError'] == false) {
          this.notificationService.showError(respData['result']['message'], 'Success');
        }
      });
    } else {
      this.authService.setLoader(false);
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }
}
