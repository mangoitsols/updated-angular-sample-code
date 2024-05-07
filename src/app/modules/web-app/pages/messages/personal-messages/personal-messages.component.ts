import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { element } from 'protractor';
import { LoginDetails, ThemeType, UserDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, UserImageService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { appSetting } from '@core/constants';
import { environment } from '@env/environment';
import { saveAs } from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-personal-messages',
  templateUrl: './personal-messages.component.html',
  styleUrls: ['./personal-messages.component.css'],
})
export class PersonalMessagesComponent implements OnInit, OnDestroy {
  language: any;
  searchSentenceForm: UntypedFormGroup;
  replyMsgForm: UntypedFormGroup;
  messageForm: UntypedFormGroup;
  replyMsgFormError: any = [];
  replyMsgSubmitted: boolean = false;
  responseMessage: string = null;
  personalInbox: boolean = true;
  personalStarred: boolean = false;
  personalSent: boolean = false;
  personalDrafts: boolean = false;
  personalAllMail: boolean = false;
  personalTrash: boolean = false;
  isReplyMsgForm: boolean = false;
  singleParticipent: boolean = false;
  multipleParticipent: boolean = false;
  messageSubmitted: boolean = false;
  personalVisiable: boolean = true;
  groupVisiable: boolean = false;
  clubVisiable: boolean = false;
  userDetails: LoginDetails;
  visiblityDropdownSettings: IDropdownSettings;
  groupDropdownSettings: IDropdownSettings;
  userDropdownCCSettings: IDropdownSettings;
  userDropdownSettings: IDropdownSettings;
  userDropdownList: { id: string; name: string }[] = [];
  userDropdownCCList: { id: string; name: string }[] = [];
  alluserDetails: { firstname: string; lastname: string; email: string }[] = [];
  alluserInfo: UserDetails;
  setTheme: ThemeType;
  extensions: any;
  imageType: string[];
  ccUser: number[] = [];
  alluserInformation: { member_id: number }[] = [];
  thumb: string;
  personalMessage: any[];
  selectedMessage: any[] = [];
  receiverUser: any[] = [];
  private activatedSub: Subscription;
  showUplodedFile: boolean = false;
  filteredArray: any[] = [];
  serverUrl: any;
  dowloading: boolean = false;
  constructor(
    private lang: LanguageService,
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private themes: ThemeService,
    private confirmDialogService: ConfirmDialogService,
    private notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService,
    private sanitizer: DomSanitizer,
    private userImageService: UserImageService
  ) {}

  ngOnInit(): void {
    this.serverUrl = environment.serverUrl;
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.extensions = appSetting.extensions;
    this.imageType = appSetting.imageType;
    this.replyMsgForm = this.formBuilder.group({
      content: ['', Validators.required],
      add_image: [''],
    });
    this.searchSentenceForm = this.formBuilder.group({
      sentence: ['', Validators.required],
      currentUid: [2],
    });
    this.messageForm = new UntypedFormGroup({
      kind: new UntypedFormControl('personal'),
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
    this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
      if (respData && respData.length > 0) {
        Object(respData).forEach((val, key) => {
          this.alluserInformation[val.keycloak_id] = { member_id: val.member_id };
          this.alluserDetails[val.keycloak_id] = { firstname: val.firstname, lastname: val.lastname, email: val.email };
          this.userDropdownList.push({ id: val.keycloak_id, name: val.firstname + ' ' + val.lastname });
          this.userDropdownCCList.push({ id: val.keycloak_id, name: val.firstname + ' ' + val.lastname });
        });
      }

      this.alluserInfo = respData;
      this.userDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        enableCheckAll: false,
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true,
        searchPlaceholderText: this.language.header.search,
      };
      this.userDropdownCCSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        enableCheckAll: false,
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true,
        searchPlaceholderText: this.language.header.search,
      };
    });
    this.getPersonalMessage();
  }

  /** To Search the user by filter */
  filterArray() {
    // No users, empty list.
    if (!this.personalMessage || this.personalMessage.length === 0) {
      this.filteredArray = [];
      return;
    }

    var input, filter;
    input = document.getElementById('myInput');
    filter = input.value;

    // No search text, all users.
    if (!filter) {
      this.filteredArray = [...this.personalMessage];
      return;
    }

    const users = [...this.personalMessage];
    this.filteredArray = users.filter(user => {
      const firstName = user.user.firstName?.toLowerCase();
      const lastName = user.user.lastName?.toLowerCase();
      const filterLowerCase = filter.toLowerCase();

      // Check if filter matches either firstName or lastName
      return firstName.includes(filterLowerCase) || lastName.includes(filterLowerCase);
    });
  }

  getPersonalMessage() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-inbox', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();
      this.filteredArray = this.personalMessage;

      this.personalInbox = true;
      this.personalStarred = false;
      this.personalSent = false;
      this.personalDrafts = false;
      this.personalAllMail = false;
      this.personalTrash = false;
      this.authService.setLoader(false);
      if (this.personalMessage && this.personalMessage.length > 0) {
        this.selectedMessage.push(this.personalMessage[0]);
      }
    });
  }

  personalMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-inbox', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();
      this.filteredArray = this.personalMessage;
      this.personalInbox = true;
      this.personalStarred = false;
      this.personalSent = false;
      this.personalDrafts = false;
      this.personalAllMail = false;
      this.personalTrash = false;
      this.authService.setLoader(false);
      if (this.personalMessage && this.personalMessage.length > 0) {
        this.selectedMessage.push(this.personalMessage[0]);
      }
    });
  }

  personalStarredMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-starred', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();
      this.filteredArray = this.personalMessage;

      this.personalInbox = false;
      this.personalStarred = true;
      this.personalSent = false;
      this.personalDrafts = false;
      this.personalAllMail = false;
      this.personalTrash = false;
      this.authService.setLoader(false);
      if (this.personalMessage && this.personalMessage.length > 0) {
        this.selectedMessage.push(this.personalMessage[0]);
      }
    });
  }

  personalSentMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-sent', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();
      this.filteredArray = this.personalMessage;

      this.personalInbox = false;
      this.personalStarred = false;
      this.personalSent = true;
      this.personalDrafts = false;
      this.personalAllMail = false;
      this.personalTrash = false;
      this.authService.setLoader(false);
      if (this.personalMessage && this.personalMessage.length > 0) {
        this.selectedMessage.push(this.personalMessage[0]);
      }
    });
  }

  personalDraftsMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-draft', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();

      this.filteredArray = this.personalMessage;

      this.personalInbox = false;
      this.personalStarred = false;
      this.personalSent = false;
      this.personalDrafts = true;
      this.personalAllMail = false;
      this.personalTrash = false;
      this.authService.setLoader(false);
      let attachmentFound = false;
    });
  }

  personalAllMailMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-all-mail', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();
      this.filteredArray = this.personalMessage;

      this.personalInbox = false;
      this.personalStarred = false;
      this.personalSent = false;
      this.personalDrafts = false;
      this.personalAllMail = true;
      this.personalTrash = false;
      this.authService.setLoader(false);
      if (this.personalMessage && this.personalMessage.length > 0) {
        this.selectedMessage.push(this.personalMessage[0]);
      }
    });
  }

  personalTrashMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-trash', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.personalMessage = [];
      this.personalMessage = respData.reverse();
      this.filteredArray = this.personalMessage;

      this.personalInbox = false;
      this.personalStarred = false;
      this.personalSent = false;
      this.personalDrafts = false;
      this.personalAllMail = false;
      this.personalTrash = true;
      this.authService.setLoader(false);
      if (this.personalMessage && this.personalMessage.length > 0) {
        this.selectedMessage.push(this.personalMessage[0]);
      }
    });
  }

  markedStarredMessages(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    let msgMoveData: { id: number; esdb_id: string; to: string } = {
      id: messageId,
      esdb_id: esdb_id,
      to: 'starred',
    };
    this.authService.memberSendRequest('post', 'message/move', msgMoveData).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.notificationService.showSuccess(this.language.community_messages.move_starreds, 'Success');
      if (this.personalInbox == true) {
        this.personalMessages();
      } else if (this.personalStarred == true) {
        this.personalStarredMessages();
      } else if (this.personalSent == true) {
        this.personalSentMessages();
      } else if (this.personalDrafts == true) {
        this.personalDraftsMessages();
      } else if (this.personalAllMail == true) {
        this.personalAllMailMessages();
      } else if (this.personalTrash == true) {
        this.personalTrashMessages();
      }
      setTimeout(() => {}, 500);
    });
  }

  unmarkedStarredMessages(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    let msgMoveData: { id: number; esdb_id: string; to: string } = {
      id: messageId,
      esdb_id: esdb_id,
      to: 'inbox',
    };
    this.authService.memberSendRequest('post', 'message/move', msgMoveData).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.notificationService.showSuccess(this.language.community_messages.move_inbox, 'Success');
      let selectedTab = $('.feature_tab .active a').text().trim();
      setTimeout(() => {
        this.personalStarredMessages();
      }, 1000);
    });
  }

  clickMessages(id: number, esdb_id: string) {
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.replyMsgSubmitted = false;
    $('.widget-app-content').removeClass('highlight');
    this.selectedMessage = [];
    if (this.personalMessage && this.personalMessage.length > 0) {
      this.personalMessage.forEach((val, index) => {
        if (val.id == id) {
          this.selectedMessage.push(val);
          this.authService.setLoader(false);
        }
      });
    }
    this.isReplyMsgForm = false;
    $('#message-' + id)
      .parent()
      .addClass('highlight');
    if (this.selectedMessage) {
      if (this.selectedMessage[0].is_read == 0) {
        this.authService.memberSendRequest('get', 'message/read-message/' + id, null).subscribe((respData: any) => {
          this.authService.updateCount(1);
          setTimeout(() => {
            $('#envelope-' + id)
              .removeClass('fa-envelope-o')
              .addClass('fa-envelope-open-o');
          }, 500);
        });
      }
    }
  }

  // function is used to clear the file-related form controls when messages are switched
  clearFileControls() {
    this.messageForm.patchValue({
      file: null,
    });
    this.messageForm.get('file').updateValueAndValidity();
    // Additional code to hide or reset any UI elements related to file display
    $('.message-upload-list').hide();
    $('.preview_img').attr('src', '');
    $('.preview_txt').hide().text('');
  }

  clickDraftMessages(id: number, esdb_id: string) {
    this.showUplodedFile = false;
    this.isReplyMsgForm = false;
    this.visiblityDropdownSettings = {};
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.replyMsgSubmitted = false;
    $('.widget-app-content').removeClass('highlight');
    this.selectedMessage = [];
    if (this.personalMessage && this.personalMessage.length > 0) {
      this.personalMessage.forEach((val, index) => {
        if (val.id == id) {
          this.selectedMessage.push(val);
          this.authService.setLoader(false);
        }
      });
    }
    this.isReplyMsgForm = false;
    $('#message-' + id)
      .parent()
      .addClass('highlight');
    let toUsers = [];
    let ccUsers = [];
    if (this.selectedMessage[0].to.length > 0) {
      this.selectedMessage[0].to.forEach((val, index) => {
        if (val) {
          toUsers.push({ id: val, name: this.alluserDetails[val].firstname + ' ' + this.alluserDetails[val].lastname });
        }
      });
    }
    if (this.selectedMessage[0].cc.length > 0) {
      this.selectedMessage[0].cc.forEach((val, index) => {
        if (val) {
          ccUsers.push({ id: val, name: this.alluserDetails[val].firstname + ' ' + this.alluserDetails[val].lastname });
        }
      });
    }
    this.messageForm.controls['kind'].setValue('personal');
    this.messageForm.controls['subject'].setValue(this.selectedMessage[0].subject);
    this.messageForm.controls['content'].setValue(this.selectedMessage[0].content);
    this.messageForm.controls['receiver_id'].setValue(toUsers);
    this.messageForm.controls['cc'].setValue(ccUsers);
    this.clearFileControls();
  }

  deleteMessages(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = false;

    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.send_msg_trash,
      () => {
        this.selectedMessage = [];
        this.authService.setLoader(true);
        let msgMoveData: { id: number; esdb_id: string; to: string } = {
          id: messageId,
          esdb_id: esdb_id,
          to: 'trash',
        };
        this.authService.memberSendRequest('post', 'message/move', msgMoveData).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.responseMessage = this.language.community_messages.move_trash;
          this.notificationService.showSuccess(this.responseMessage, 'Success');
          // setTimeout(() => {
          //   this.responseMessage = '';
          // }, 2000);;
          if (this.personalInbox == true) {
            this.personalMessages();
          } else if (this.personalStarred == true) {
            this.personalStarredMessages();
          } else if (this.personalSent == true) {
            this.personalSentMessages();
          } else if (this.personalDrafts == true) {
            this.personalDraftsMessages();
          } else if (this.personalAllMail == true) {
            this.personalAllMailMessages();
          } else if (this.personalTrash == true) {
            this.personalTrashMessages();
          }
        });
      },
      () => {}
    );
  }

  deleteMessagesPermanently(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = false;

    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.permanently_delete_msg,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'message/deny-message/' + esdb_id, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.responseMessage = this.language.community_messages.permanently_delete;
          this.notificationService.showSuccess(this.responseMessage, 'Success');
          let selectedTab: any = $('.feature_tab .active a').text().trim();
          setTimeout(() => {
            this.personalTrashMessages();
          }, 500);
        });
      },
      () => {}
    );
  }

  stringifiedData(data: string) {
    if (data) {
      return JSON.parse(data);
    }
  }

  replyToMessages(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = true;
    this.singleParticipent = true;
    this.multipleParticipent = false;
    var rply = this.language.community_messages.reply;
    setTimeout(() => {
      $('#reply-heading').text(rply);
      $('#replyMsgType').val('reply');
      $('#replyToMsgId').val(esdb_id);
    }, 500);
  }

  replayToAllMessages(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = true;
    this.singleParticipent = false;
    this.multipleParticipent = true;
    setTimeout(() => {
      $('#reply-heading').text(this.language.community_messages.replyToAll);
      $('#replyMsgType').val('replyAll');
      $('#replyToMsgId').val(esdb_id);
    }, 500);
  }

  replyMessage() {
    let msgType: any = $('#replyMsgType').val();
    let esdb_id: any = $('#replyToMsgId').val();
    this.replyMsgSubmitted = true;
    if (this.replyMsgForm.valid) {
      var formData: FormData = new FormData();
      formData.append('file', this.replyMsgForm.get('add_image').value);
      formData.append('content', this.replyMsgForm.get('content').value);
      if (msgType == 'reply') {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('post', 'message/reply/' + esdb_id, formData).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.replyMsgSubmitted = false;
          if (respData.isError == false) {
            this.notificationService.showSuccess(respData.result, 'Success');
          } else {
            this.notificationService.showError(respData.result, 'Error');
          }
          this.replyMsgForm.reset();
          this.isReplyMsgForm = false;
          let selectedTab: any = $('.feature_tab .active a').text().trim();
          setTimeout(() => {
            if (this.personalInbox == true) {
              this.personalMessages();
            } else if (this.personalStarred == true) {
              this.personalStarredMessages();
            } else if (this.personalSent == true) {
              this.personalSentMessages();
            } else if (this.personalDrafts == true) {
              this.personalDraftsMessages();
            } else if (this.personalAllMail == true) {
              this.personalAllMailMessages();
            } else if (this.personalTrash == true) {
              this.personalTrashMessages();
            }
          }, 500);
        });
      } else {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('post', 'message/reply-to-all/' + esdb_id, formData).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.replyMsgSubmitted = false;
          if (respData.isError == false) {
            this.notificationService.showSuccess(respData.result, 'Success');
          } else {
            this.notificationService.showError(respData.result, 'Error');
          }
          this.replyMsgForm.reset();
          this.isReplyMsgForm = false;
          let selectedTab: any = $('.feature_tab .active a').text().trim();
          setTimeout(() => {
            if (this.personalInbox == true) {
              this.personalMessages();
            } else if (this.personalStarred == true) {
              this.personalStarredMessages();
            } else if (this.personalSent == true) {
              this.personalSentMessages();
            } else if (this.personalDrafts == true) {
              this.personalDraftsMessages();
            } else if (this.personalAllMail == true) {
              this.personalAllMailMessages();
            } else if (this.personalTrash == true) {
              this.personalTrashMessages();
            }
          }, 500);
        });
      }
    }
  }

  errorImage: any = { isError: false, errorMessage: '' };
  uploadFile(event: Event) {
    const file: File = (event.target as HTMLInputElement).files[0];
    const mimeType: string = file.type;
    this.errorImage = { Error: true, errorMessage: '' };
    this.replyMsgForm.patchValue({
      add_image: file,
    });
    this.replyMsgForm.get('add_image').updateValueAndValidity();
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);
    var url: any;
    reader.onload = _event => {
      url = reader.result;
      $('.message-upload-list').show();
      if (mimeType.match(/image\/*/)) {
        $('.preview_img').attr('src', url);
      } else {
        $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
      }
    };
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);
  }

  uploadDraftFile(event: Event) {
    const file: File = (event.target as HTMLInputElement).files[0];

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
      $('.message-upload-list').show();
      if (mimeType.match(/image\/*/)) {
        $('.preview_img').attr('src', url);
      } else {
        $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
      }
    };
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);
    if (this.messageForm.value.file) {
      this.showUplodedFile = true;
    }
  }

  showToggle: boolean = false;
  onShow() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('reply-users');
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = 'reply-users show';
    } else {
      this.showToggle = false;
      el[0].className = 'reply-users';
    }
  }

  showMore: boolean = false;
  onOpen() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('multipl-participent-reply reply-users');
    if (!this.showMore) {
      this.showMore = true;
      el[0].className = 'multipl-participent-reply reply-users show';
    } else {
      this.showMore = false;
      el[0].className = 'multipl-participent-reply reply-users';
    }
  }

  messageProcess() {
    this.messageSubmitted = true;

    if (this.messageForm.valid) {
      var formData: FormData = new FormData();
      this.receiverUser = [];
      this.ccUser = [];
      if (this.messageForm.controls['receiver_id'].value.length > 0) {
        this.messageForm.controls['receiver_id'].value.forEach((val, index) => {
          this.receiverUser.push(val.id);
        });
      }
      if (this.messageForm.controls['cc'].value.length > 0) {
        this.messageForm.controls['cc'].value.forEach((val, index) => {
          this.ccUser.push(val.id);
        });
      }
      this.messageForm.controls['receiver_id'].setValue(this.receiverUser);
      this.messageForm.controls['cc'].setValue(this.ccUser);
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
      this.authService.memberSendRequest('post', 'message/send', formData).subscribe(
        (respData: any) => {
          this.messageSubmitted = false;
          if (respData['isError'] == false) {
            this.notificationService.showSuccess(respData['result'], 'Success');
            this.messageForm.reset();
            this.messageForm.controls['kind'].setValue([]);
            this.messageForm.controls['receiver_id'].setValue([]);
            this.messageForm.controls['cc'].setValue([]);
            this.authService.memberSendRequest('delete', 'message/delete-draft/' + this.selectedMessage[0].id, null).subscribe((respData: any) => {
              this.authService.setLoader(false);
              this.notificationService.showSuccess(this.language.community_messages.message_sent, 'Success');
              setTimeout(() => {
                this.personalDraftsMessages();
              }, 500);
            });
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  deleteDraftMessages(messageId: number, esdb_id: string) {
    this.isReplyMsgForm = false;

    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.permanently_delete_msg,
      () => {
        this.selectedMessage = [];
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'message/delete-draft/' + messageId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.responseMessage = this.language.community_messages.permanently_delete;
          this.notificationService.showSuccess(this.responseMessage, 'Success');
          let selectedTab = $('.feature_tab .active a').text().trim();
          setTimeout(() => {
            this.personalDraftsMessages();
          }, 500);
        });
      },
      () => {}
    );
  }

  download(path: any) {
    this.dowloading = true;
    let filename = path;
    let url = environment.serverUrl + '/proxyMsg/' + filename;
    saveAs(url, filename);
    setTimeout(() => {
      this.dowloading = false;
    }, 1000);
    // const link = document.createElement('a');
    // link.download = filename;
    // link.href = url;
    // link.target = '_blank';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  }

  onReceiverSelect(item: { id: string; name: string }) {
    this.receiverUser.push(item.id);
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

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
