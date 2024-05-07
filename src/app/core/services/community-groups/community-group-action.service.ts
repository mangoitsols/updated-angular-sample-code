import { Injectable } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { ConfirmDialogService } from '@shared/components';
import { LanguageService, NotificationService } from '@core/services';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CommunityGroupActionService {
  private readonly _useCommunityGroups = new UseCommunityGroups();
  private readonly language: any;

  constructor(private _confirmDialogService: ConfirmDialogService, private _notificationService: NotificationService, private _languageService: LanguageService, private _router: Router) {
    this.language = this._languageService.getLanguageFile();
  }

  deleteGroup(groupDetails: { id: number; name: string }): Promise<any> {
    if (!groupDetails || groupDetails.id === undefined || !groupDetails.name) {
      return Promise.reject('Invalid group details');
    }

    return new Promise((resolve, reject) => {
      this._confirmDialogService.confirmThis(
        `${this.language?.confirmation_message.deleteGroup_popup} <u>${groupDetails.name} </u> ${this.language?.create_task.group}?`,
        () => {
          this._useCommunityGroups
            .deleteGroup(+groupDetails.id)
            .pipe(untilDestroyed(this))
            .subscribe(
              resp => {
                this._router.navigate(['/web/community/groups']);
                resolve(resp);
              },
              error => reject(error)
            );
        },
        () => reject('Deletion cancelled')
      );
    });
  }

  leaveGroup(groupDetails: { id: number; name: string }): Promise<any> {
    if (!groupDetails || groupDetails.id === undefined || !groupDetails.name) {
      return Promise.reject('Invalid group details');
    }
    return new Promise((resolve, reject) => {
      this._confirmDialogService.confirmThis(
        `${this.language?.confirmation_message.leaveGroupConfirm_popup} <u>${groupDetails.name}</u> ${this.language?.create_task.group}?`,
        () => {
          this._useCommunityGroups
            .leaveGroup(+groupDetails.id)
            .pipe(untilDestroyed(this))
            .subscribe(
              resp => {
                this._router.navigate(['/web/community/groups']);
                this._notificationService.showSuccess(`You have left ${groupDetails.name} group`, 'Success');
                resolve(resp);
              },
              error => reject(error)
            );
        },
        () => reject('Leaving cancelled')
      );
    });
  }

  joinGroup(groupDetails: { id: number; name: string }): Promise<any> {
    if (!groupDetails || groupDetails.id === undefined || !groupDetails.name) {
      return Promise.reject('Invalid group details');
    }
    return new Promise((resolve, reject) => {
      this._useCommunityGroups
        .joinGroup(+groupDetails.id)
        .pipe(untilDestroyed(this))
        .subscribe(
          resp => {
            this._notificationService.showSuccess(`You have joined ${groupDetails.name} group`, 'Success');
            resolve(resp);
          },
          error => reject(error)
        );
    });
  }
}
