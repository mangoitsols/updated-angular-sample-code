import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { AuthorizationAccess, CommunityGroup, CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService, UserImageService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;

@Component({
  selector: 'app-create-message',
  templateUrl: './create-message.component.html',
  styleUrls: ['./create-message.component.css'],
})
export class CreateMessageComponent implements OnInit, OnDestroy {
  language: any;

  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  visiblityDropdownSettings: IDropdownSettings;
  groupDropdownSettings: IDropdownSettings;
  userDropdownCCSettings: IDropdownSettings;
  userDropdownSettings: IDropdownSettings;
  userDropdownList: { id: string; name: string; image: SafeUrl }[] = [];
  userDropdownCCList: { id: string; name: string }[] = [];
  alluserDetails: { firstname: string; lastname: string; email: string }[] = [];
  ccUser: number[] = [];
  responseMessage: string = null;
  messageForm: UntypedFormGroup;
  messageSubmitted: boolean = false;
  personalVisiable: boolean = true;
  groupVisiable: boolean = false;
  clubVisiable: boolean = false;
  groups: CommunityGroup[];
  teamId: number;
  setTheme: ThemeType;
  receiverUser: any[] = [];
  visiblity: { id: string; name: string }[] = [];
  thumb: SafeUrl;
  alluserInformation: { firstname: string; lastname: string; email: string; image: SafeUrl }[] = [];
  kindIds: number[] = [];
  selectedVisiblity: string;
  selectedKindId: number;
  files: string[] = [];
  receipientUsers: { approved_status: number; group_id: number; groupusers: { email: string; firstname: string; id: number; lastname: string; username: string }[]; id: number; user_id: number }[] = [];
  alluserInfo: any;
  private activatedSub: Subscription;
  breadCrumbItems: Array<BreadcrumbItem>;
  isLoading: boolean = false;

  constructor(
    private lang: LanguageService,
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
    private themes: ThemeService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private commonFunctionService: CommonFunctionService,
    private userImageService: UserImageService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = this.userDetails.team_id;
    let userRole: string = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;
    this.getGroup();
    this.getAllUserInfo();
    this.initBreadcrumb();

    this.visiblity = [
      { id: 'personal', name: this.language.create_message.personalMsg },
      { id: 'group', name: this.language.create_message.groupMsg },
    ];

    // if (this.createAccess.message == 'Yes') {
    if (this.createAccess.message == 'Yes' && userRole != 'member') {
      this.visiblity.push({ id: 'club', name: this.language.create_message.clubMsg });
    }

    this.visiblityDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
      closeDropDownOnSelection: true,
    };

    this.messageForm = new UntypedFormGroup({
      kind: new UntypedFormControl('', Validators.required),
      receiver_id: new UntypedFormControl('', Validators.required),
      subject: new UntypedFormControl('', Validators.required),
      content: new UntypedFormControl('', Validators.required),
      type: new UntypedFormControl('text'),
      sender_id: new UntypedFormControl(this.userDetails.id),
      file: new UntypedFormControl(''),
      message_type: new UntypedFormControl('inbox'),
      kind_id: new UntypedFormControl(''),
      cc: new UntypedFormControl(''),
    });
  }

  /**
   * Function to get all the Club Users
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all the Users
   */
  getAllUserInfo() {
    let img: any;
    this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
      if (respData && respData.length > 0) {
        Object(respData).forEach((val, key) => {
          this.alluserInformation[val.keycloak_id] = { firstname: val.firstname, lastname: val.lastname, email: val.email, image: ' ' };
          if (val && val.member_id != null) {
            this.authService.memberPhotoRequest('get', 'profile-photo/' + val.member_id, null).subscribe(
              (resppData: any) => {
                this.thumb = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(resppData)) as string;
                this.alluserInformation[val.keycloak_id].image = this.thumb;
              },
              (error: any) => {
                this.alluserInformation[val.keycloak_id].image = null;
              }
            );
          }

          this.userDropdownList.push({ id: val.keycloak_id, name: val.firstname + ' ' + val.lastname, image: val.image });
          this.userDropdownCCList.push({ id: val.keycloak_id, name: val.firstname + ' ' + val.lastname });
        });
      }
      this.alluserDetails = respData;
      this.alluserInfo = respData;
      this.userDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: this.language.profile.select_all,
        enableCheckAll: true,
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true,
        searchPlaceholderText: this.language.header.search,
      };
      this.userDropdownCCSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: this.language.profile.select_all,
        enableCheckAll: false,
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true,
        searchPlaceholderText: this.language.header.search,
      };
    });
  }

  getGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamgroups/' + this.teamId, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.groups = respData;
        this.groupDropdownSettings = {
          singleSelection: true,
          idField: 'id',
          textField: 'name',
          selectAllText: 'this.language.profile.select_all',
          enableCheckAll: false,
          unSelectAllText: 'UnSelect All',
          allowSearchFilter: true,
          searchPlaceholderText: this.language.header.search,
          closeDropDownOnSelection: true,
        };
      });
    }
  }

  messageProcess() {
    // this.isLoading = true; // to set the isLoading class on body div
    this.messageSubmitted = true;
    if (this.messageForm.valid) {
      var formData: FormData = new FormData();
      this.messageForm.controls['kind'].setValue(this.selectedVisiblity);
      var uniqueReceiverUsers = this.authService.uniqueData(this.receiverUser);
      this.messageForm.controls['receiver_id'].setValue(uniqueReceiverUsers);

      var uniqueCcUser = this.authService.uniqueData(this.ccUser);
      this.messageForm.controls['cc'].setValue(uniqueCcUser);

      if (this.selectedKindId) {
        //var uniqueKindUser = this.authService.uniqueData(this.selectedKindId);
        this.messageForm.controls['kind_id'].setValue(this.selectedKindId);
      } else {
        this.messageForm.controls['kind_id'].setValue('');
      }
      for (const key in this.messageForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.messageForm.value, key)) {
          const element: any = this.messageForm.value[key];
          if (key == 'file') {
            formData.append('file', element);
          } else if (key == 'receiver_id') {
            if (element && element.length > 0) {
              element.forEach((value, key) => {
                formData.append('receiver_id[' + key + ']', value);
              });
            }
          } else if (key == 'cc') {
            if (element && element.length > 0) {
              element.forEach((value, key) => {
                formData.append('cc[' + key + ']', value);
              });
            }
          } else {
            formData.append(key, element);
          }
        }
      }
      let kindValue: string = this.messageForm.controls['kind'].value;

      if (kindValue == 'personal') {
        this.authService.setLoader(true);
        this.isLoading = true;
        this.authService.memberSendRequest('post', 'message/send', formData).subscribe(
          (respData: any) => {
            this.isLoading = false; // Remove "isLoading" class on success
            this.authService.setLoader(false);
            this.messageSubmitted = false;
            if (respData['isError'] == false) {
              this.receipientUsers = [];
              this.receiverUser = [];
              this.ccUser = [];
              this.notificationService.showSuccess(respData['result'], 'Success');
              this.messageForm.reset();
              this.messageForm.controls['kind'].setValue([]);
              this.messageForm.controls['receiver_id'].setValue([]);
              this.messageForm.controls['cc'].setValue([]);
              $('.message_title').click();
              setTimeout(() => {
                localStorage.setItem('backItem', 'personalMsg');
                if (window.innerWidth < 768) {
                  this.router.navigate(['mobile/community/community-messages']);
                } else {
                  this.router.navigate(['/web/community/personal-msg']);
                }
              }, 1000);
            } else if (respData['code'] == 400) {
              this.notificationService.showError(respData['message']['message'], 'Error');
            } else {
              this.notificationService.showError(respData['message']['message'], 'Error');
            }
          },
          err => {
            this.isLoading = false; // Remove "isLoading" class on error
            console.log(err);
          }
        );
      } else if (kindValue == 'group') {
        this.authService.setLoader(true);
        this.isLoading = true;
        this.authService.memberSendRequest('post', 'message/send-group-message', formData).subscribe(
          (respData: any) => {
            this.isLoading = false; // Remove "isLoading" class on success
            this.authService.setLoader(false);
            this.messageSubmitted = false;

            if (respData['isError'] == false) {
              this.receipientUsers = [];
              this.receiverUser = [];
              this.ccUser = [];
              this.notificationService.showSuccess(respData['result'], 'Success');
              this.messageForm.controls['kind'].setValue([]);
              this.messageForm.controls['kind_id'].setValue([]);
              this.messageForm.reset();
              $('.message_title').click();
              setTimeout(() => {
                localStorage.setItem('backItem', 'groupMsg');
                if (window.innerWidth < 768) {
                  this.router.navigate(['mobile/community/community-messages']);
                } else {
                  this.router.navigate(['/web/community/personal-msg']);
                }
              }, 1000);
            } else if (respData['code'] == 400) {
              this.notificationService.showError(respData['message'], 'Error');
            }
          },
          err => {
            this.isLoading = false; // Remove "isLoading" class on error
            console.log(err);
          }
        );
      } else if (kindValue == 'club') {
        this.authService.setLoader(true);
        this.isLoading = true;
        this.authService.memberSendRequest('post', 'message/send-club-message', formData).subscribe(
          (respData: any) => {
            this.isLoading = false; // Remove "isLoading" class on success
            this.authService.setLoader(false);
            this.messageSubmitted = false;
            if (respData['isError'] == false) {
              this.receipientUsers = [];
              this.receiverUser = [];
              this.ccUser = [];
              this.notificationService.showSuccess(respData['result'], 'Success');
              this.messageForm.controls['kind'].setValue([]);
              this.messageForm.controls['receiver_id'].setValue([]);
              this.messageForm.controls['cc'].setValue([]);
              this.messageForm.reset();
              $('.message_title').click();
              setTimeout(() => {
                localStorage.setItem('backItem', 'clubMsg');
                if (window.innerWidth < 768) {
                  this.router.navigate(['mobile/community/community-messages']);
                } else {
                  this.router.navigate(['/web/community/personal-msg']);
                }
              }, 1000);
            } else if (respData['code'] == 400) {
              this.notificationService.showError(respData['message'], 'Error');
            }
          },
          err => {
            this.isLoading = false; // Remove "isLoading" class on error
            console.log(err);
          }
        );
      }
    }
  }

  close() {
    if (this.receiverUser.length > 0 || this.kindIds.length > 0 || this.kindIds.length > 0) {
      this.confirmDialogService.confirmThis(
        this.language.confirmation_message.save_msg_draft,
        () => {
          var formData: FormData = new FormData();
          this.messageForm.controls['kind'].setValue(this.selectedVisiblity);
          this.messageForm.controls['receiver_id'].setValue(this.receiverUser);
          this.messageForm.controls['cc'].setValue(this.ccUser);

          if (this.selectedKindId) {
            this.messageForm.controls['kind_id'].setValue(this.selectedKindId);
          } else {
            this.messageForm.controls['kind_id'].setValue(1);
          }

          this.messageForm.controls['message_type'].setValue('draft');
          for (const key in this.messageForm.value) {
            if (Object.prototype.hasOwnProperty.call(this.messageForm.value, key)) {
              const element: any = this.messageForm.value[key];
              if (key == 'file') {
                formData.append('file', element);
              } else if (key == 'receiver_id') {
                if (element && element.length > 0) {
                  element.forEach((value, key) => {
                    formData.append('receiver_id[' + key + ']', value);
                  });
                }
              } else if (key == 'cc') {
                if (element && element.length > 0) {
                  element.forEach((value, key) => {
                    formData.append('cc[' + key + ']', value);
                  });
                }
              } else {
                formData.append(key, element);
              }
            }
          }

          let kindValue: string = this.messageForm.controls['kind'].value;
          if (kindValue == 'personal') {
            this.authService.setLoader(true);
            this.authService.memberSendRequest('post', 'message/send', formData).subscribe(
              (respData: any) => {
                this.authService.setLoader(false);
                this.messageSubmitted = false;
                if (respData['isError'] == false) {
                  this.responseMessage = this.language.community_messages.email_draft;
                  this.notificationService.showSuccess(this.responseMessage, 'Success');
                  setTimeout(() => {
                    //   this.responseMessage = ''
                    this.messageForm.reset();
                  }, 3000);
                  this.messageForm.controls['kind'].setValue([]);
                  this.messageForm.controls['receiver_id'].setValue([]);
                  this.messageForm.controls['cc'].setValue([]);
                  $('.message_title').click();
                  setTimeout(() => {
                    localStorage.setItem('backItem', 'personalMsg');
                    if (window.innerWidth < 768) {
                      this.router.navigate(['mobile/community/community-messages']);
                    } else {
                      this.router.navigate(['/web/community/personal-msg']);
                    }
                  }, 1000);
                } else if (respData['code'] == 400) {
                  this.responseMessage = respData['message'];
                  this.notificationService.showError(this.responseMessage, 'Error');
                }
              },
              err => {
                console.log(err);
              }
            );
          } else if (kindValue == 'group') {
            this.authService.setLoader(true);
            this.authService.memberSendRequest('post', 'message/send-group-message', formData).subscribe(
              (respData: any) => {
                this.authService.setLoader(false);
                this.messageSubmitted = false;
                if (respData['isError'] == false) {
                  this.responseMessage = this.language.community_messages.email_draft;
                  this.notificationService.showSuccess(this.responseMessage, 'Success');
                  this.messageForm.controls['kind'].setValue([]);
                  this.messageForm.controls['kind_id'].setValue([]);
                  this.messageForm.reset();
                  $('.message_title').click();
                  setTimeout(() => {
                    localStorage.setItem('backItem', 'groupMsg');
                    if (window.innerWidth < 768) {
                      this.router.navigate(['mobile/community/community-messages']);
                    } else {
                      this.router.navigate(['/web/community/personal-msg']);
                    }
                  }, 1000);
                } else if (respData['code'] == 400) {
                  this.responseMessage = respData['message'];
                  this.notificationService.showError(this.responseMessage, 'Error');
                }
              },
              err => {
                console.log(err);
              }
            );
          } else if (kindValue == 'club') {
            this.authService.setLoader(true);
            this.authService.memberSendRequest('post', 'message/send-club-message', formData).subscribe(
              (respData: any) => {
                this.authService.setLoader(false);
                this.messageSubmitted = false;
                if (respData['isError'] == false) {
                  this.responseMessage = this.language.community_messages.email_draft;
                  this.notificationService.showSuccess(this.responseMessage, 'Success');
                  this.messageForm.controls['kind'].setValue([]);
                  this.messageForm.controls['receiver_id'].setValue([]);
                  this.messageForm.controls['cc'].setValue([]);
                  this.messageForm.reset();
                  $('.message_title').click();
                  setTimeout(() => {
                    localStorage.setItem('backItem', 'clubMsg');
                    if (window.innerWidth < 768) {
                      this.router.navigate(['mobile/community/community-messages']);
                    } else {
                      this.router.navigate(['/web/community/personal-msg']);
                    }
                  }, 1000);
                } else if (respData['code'] == 400) {
                  this.responseMessage = respData['message'];
                  this.notificationService.showError(this.responseMessage, 'Error');
                }
              },
              err => {
                console.log(err);
              }
            );
          }
        },
        () => {
          if (window.innerWidth < 768) {
            this.router.navigate(['mobile/community/community-messages']);
          } else {
            this.router.navigate(['/web/community/personal-msg']);
          }
        }
      );
    } else {
      if (window.innerWidth < 768) {
        this.router.navigate(['mobile/community/community-messages']);
      } else {
        this.router.navigate(['/web/community/personal-msg']);
      }
    }
  }

  onVisiblityDeSelect(item: { id: string; name: string }) {
    this.receipientUsers = [];
    this.receiverUser = [];
    this.ccUser = [];
    this.messageForm.controls['receiver_id'].setValue('');
    this.messageForm.controls['cc'].setValue('');
    this.messageForm.controls['kind_id'].setValue('');
  }

  onVisiblitySelect(item: { id: string; name: string }) {
    this.selectedVisiblity = item.id;
    this.receipientUsers = [];
    this.receiverUser = [];
    this.ccUser = [];
    if (this.selectedVisiblity == 'personal') {
      this.messageForm.controls['kind_id'].clearValidators();
      this.messageForm.controls['receiver_id'].setValidators(Validators.required);
      this.messageForm.controls['receiver_id'].setValue('');
      this.messageForm.controls['cc'].setValue('');
      this.messageForm.controls['receiver_id'].updateValueAndValidity();
      this.personalVisiable = true;
      this.groupVisiable = false;
      this.clubVisiable = false;
    } else if (this.selectedVisiblity == 'group') {
      this.messageForm.controls['receiver_id'].clearValidators();
      this.messageForm.controls['receiver_id'].setValue('');
      this.messageForm.controls['cc'].setValue('');
      this.messageForm.controls['kind_id'].setValidators(Validators.required);
      this.messageForm.controls['kind_id'].setValue('');
      this.messageForm.controls['kind_id'].updateValueAndValidity();
      this.personalVisiable = false;
      this.groupVisiable = true;
      this.clubVisiable = false;
    } else {
      this.messageForm.controls['kind_id'].clearValidators();
      this.messageForm.controls['receiver_id'].setValidators(Validators.required);
      this.messageForm.controls['receiver_id'].setValue('');
      this.messageForm.controls['cc'].setValue('');
      this.messageForm.controls['receiver_id'].updateValueAndValidity();
      this.personalVisiable = true;
      this.groupVisiable = false;
      this.clubVisiable = true;
    }
  }

  onKindIdSelect(item: { id: number; name: string }) {
    this.kindIds = [];
    this.receipientUsers = [];
    this.receiverUser = [];
    this.selectedKindId = item.id;
    this.kindIds.push(this.selectedKindId);
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + this.selectedKindId, null).subscribe((respData: any) => {
      if (respData.participants) {
        respData.participants.forEach((element: any) => {
          if (element.approved_status == 1) {
            this.receipientUsers.push(element);
            let obj = this.alluserInfo.find(o => o.id == element.user_id);
            this.receiverUser.push(obj.keycloak_id);
          }
        });
      }
    });
  }

  onKindIdDeSelect(item: { id: number; name: string }) {
    this.selectedKindId = item.id;
    this.receipientUsers = [];
    this.receiverUser = [];
    const index: number = this.kindIds.indexOf(this.selectedKindId);
    if (index > -1) {
      this.kindIds.splice(index, 1);
    }
  }

  onReceiverSelect(item: { id: string; name: string }) {
    this.receiverUser.push(item.id);
  }

  onReceiverSelectAll(item: { id: string; name: string }) {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const element = item[key];
        this.receiverUser.push(element.id);
      }
    }
  }

  onReceiverDeSelectAll(item: { id: string; name: string }) {
    this.receiverUser = [];
  }

  onReceiverDeSelect(item: { id: string; name: string }) {
    const index = this.receiverUser.indexOf(item.id);
    if (index > -1) {
      this.receiverUser.splice(index, 1);
    }
  }

  onCCSelect(item: { id: number; name: string }) {
    this.ccUser.push(item.id);
  }

  onCCDeSelect(item: { id: number; name: string }) {
    const index = this.ccUser.indexOf(item.id);
    if (index > -1) {
      this.ccUser.splice(index, 1);
    }
  }

  uploadFile(event: Event) {
    const file: File = (event.target as HTMLInputElement).files[0];
    if (file) {
      const mimeType: string = file.type;
      this.messageForm.patchValue({
        file: file,
      });
      this.messageForm.get('file').updateValueAndValidity();

      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      var url: any;
      reader.onload = _event => {
        url = reader.result;
        if (mimeType.match(/image\/*/)) {
          $('.preview_img').attr('src', url);
        } else {
          $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
        }
      };
      $('.message-upload-list').show();
      $('.preview_txt').show();
      $('.preview_txt').text(file.name);
    }
  }

  onFileChange(event: Event) {
    for (var i = 0; i < event.target['files'].length; i++) {
      this.files.push(event.target['files'][i]);
    }
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Community', link: '/web/community/community-messages' }, { label: this.language.create_message.title }];
  }

  onCancel() {
    if (window.innerWidth < 768) {
      this.router.navigate(['mobile/community/community-messages']);
    } else {
      this.router.navigate(['/web/community/personal-msg']);
    }
    //window.history.back();
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
