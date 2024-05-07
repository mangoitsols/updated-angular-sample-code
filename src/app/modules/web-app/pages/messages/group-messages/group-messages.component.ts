import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { CommunityGroup, LoginDetails, ThemeType, UserDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, UserImageService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { appSetting } from '@core/constants';
import { environment } from '@env/environment';
import { saveAs } from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-group-messages',
  templateUrl: './group-messages.component.html',
  styleUrls: ['./group-messages.component.css'],
})
export class GroupMessagesComponent implements OnInit, OnDestroy {
  language: any;
  replyMsgForm: UntypedFormGroup;
  messageForm: UntypedFormGroup;
  replyMsgSubmitted: boolean = false;
  groupInbox: boolean = true;
  groupStarred: boolean = false;
  groupSent: boolean = false;
  groupDrafts: boolean = false;
  groupAllMail: boolean = false;
  isReplyMsgForm: boolean = false;
  singleParticipent: boolean = false;
  multipleParticipent: boolean = false;
  messageSubmitted: boolean = false;
  personalVisiable: boolean = true;
  groupVisiable: boolean = false;
  clubVisiable: boolean = false;
  groupTrash: boolean = false;
  responseMessage: string = null;
  extensions: any;
  imageType: string[];
  setTheme: ThemeType;
  visiblityDropdownSettings: IDropdownSettings;
  groupDropdownSettings: IDropdownSettings;
  userDropdownSettings: IDropdownSettings;
  userDropdownCCSettings: IDropdownSettings;
  userDropdownList: { id: string; name: string }[] = [];
  userDropdownCCList: { id: string; name: string }[] = [];
  alluserDetails: { firstname: string; lastname: string; email: string }[] = [];
  alluserInfo: UserDetails;
  ccUser: number[] = [];
  userDetails: LoginDetails;
  teamId: number;
  groups: CommunityGroup[];
  receipientUsers: any = [];
  selectedMessage: any[] = [];
  receiverUser: any[] = [];
  thumb: string;
  alluserInformation: { member_id: number }[] = [];
  groupMessage: any[];
  private activatedSub: Subscription;
  filteredArray: any[] = [];
  showUplodedFile: boolean = false;
  dowloading: boolean = false;
  serverUrl: any;
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
    this.teamId = this.userDetails.team_id;
    this.extensions = appSetting.extensions;
    this.imageType = appSetting.imageType;
    this.getGroupMessage();
    this.replyMsgForm = this.formBuilder.group({
      content: ['', Validators.required],
      add_image: [''],
    });
    this.getGroup();
    this.messageForm = new UntypedFormGroup({
      kind: new UntypedFormControl('group'),
      receiver_id: new UntypedFormControl(''),
      subject: new UntypedFormControl('', Validators.required),
      content: new UntypedFormControl('', Validators.required),
      type: new UntypedFormControl('text'),
      sender_id: new UntypedFormControl(this.userDetails.id),
      file: new UntypedFormControl(''),
      message_type: new UntypedFormControl('inbox'),
      kind_id: new UntypedFormControl('', Validators.required),
      cc: new UntypedFormControl(''),
    });
    this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
      if (respData && respData.length > 0) {
        Object(respData).forEach((val, key) => {
          this.alluserInformation[val.keycloak_id] = { member_id: val.member_id };
          this.alluserDetails[val.keycloak_id] = {
            firstname: val.firstname,
            lastname: val.lastname,
            email: val.email,
          };
        });
      }
    });
  }

  /** To Search the user by filter */
  filterArray() {
    // No users, empty list.
    if (!this.groupMessage || this.groupMessage.length === 0) {
      this.filteredArray = [];
      return;
    }

    var input, filter;
    input = document.getElementById('myInput');
    filter = input.value;

    // No search text, all users.
    if (!filter) {
      this.filteredArray = [...this.groupMessage];
      return;
    }

    const users = [...this.groupMessage];
    this.filteredArray = users.filter(user => {
      const firstName = user.user.firstName?.toLowerCase();
      const lastName = user.user.lastName?.toLowerCase();
      const filterLowerCase = filter.toLowerCase();

      // Check if filter matches either firstName or lastName
      return firstName.includes(filterLowerCase) || lastName.includes(filterLowerCase);
    });
  }

  getGroupMessage() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-inbox', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = true;
      this.groupStarred = false;
      this.groupSent = false;
      this.groupDrafts = false;
      this.groupAllMail = false;
      this.groupTrash = false;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.selectedMessage.push(this.groupMessage[0]);
      }
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
      if (this.selectedMessage && this.selectedMessage.length > 0) {
        this.selectedMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
    });
  }

  groupMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-inbox', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = true;
      this.groupStarred = false;
      this.groupSent = false;
      this.groupDrafts = false;
      this.groupAllMail = false;
      this.groupTrash = false;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.selectedMessage.push(this.groupMessage[0]);
      }
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
      if (this.selectedMessage && this.selectedMessage.length > 0) {
        this.selectedMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
    });
  }

  stringifiedData(data: string) {
    return JSON.parse(data);
  }

  groupStarredMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-starred', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = false;
      this.groupStarred = true;
      this.groupSent = false;
      this.groupDrafts = false;
      this.groupAllMail = false;
      this.groupTrash = false;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.selectedMessage.push(this.groupMessage[0]);
      }
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
      if (this.selectedMessage && this.selectedMessage.length > 0) {
        this.selectedMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
    });
  }

  groupSentMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-sent', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = false;
      this.groupStarred = false;
      this.groupSent = true;
      this.groupDrafts = false;
      this.groupAllMail = false;
      this.groupTrash = false;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.selectedMessage.push(this.groupMessage[0]);
      }
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
      if (this.selectedMessage && this.selectedMessage.length > 0) {
        this.selectedMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
    });
  }

  groupDraftsMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-draft', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = false;
      this.groupStarred = false;
      this.groupSent = false;
      this.groupDrafts = true;
      this.groupAllMail = false;
      this.groupTrash = false;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
    });
  }

  groupAllMailMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-allmails', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = false;
      this.groupStarred = false;
      this.groupSent = false;
      this.groupDrafts = false;
      this.groupAllMail = true;
      this.groupTrash = false;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.selectedMessage.push(this.groupMessage[0]);
      }
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
      if (this.selectedMessage && this.selectedMessage.length > 0) {
        this.selectedMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
    });
  }

  groupTrashMessages() {
    this.isReplyMsgForm = false;
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'message/get-group-trash', null).subscribe((respData: any) => {
      // this.responseMessage = null;
      this.groupMessage = [];
      this.groupMessage = respData.reverse();
      this.filteredArray = this.groupMessage;

      this.groupInbox = false;
      this.groupStarred = false;
      this.groupSent = false;
      this.groupDrafts = false;
      this.groupAllMail = false;
      this.groupTrash = true;
      this.authService.setLoader(false);
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.selectedMessage.push(this.groupMessage[0]);
      }
      if (this.groupMessage && this.groupMessage.length > 0) {
        this.groupMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
      }
      if (this.selectedMessage && this.selectedMessage.length > 0) {
        this.selectedMessage.forEach(element => {
          if (element.group.image && element.group.image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.group.id, 'group');
            element.group.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.group.token);
          }
        });
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
      setTimeout(() => {
        if (this.groupInbox == true) {
          this.groupMessages();
        } else if (this.groupStarred == true) {
          this.groupStarredMessages();
        } else if (this.groupSent == true) {
          this.groupSentMessages();
        } else if (this.groupDrafts == true) {
          this.groupDraftsMessages();
        } else if (this.groupAllMail == true) {
          this.groupAllMailMessages();
        } else if (this.groupTrash == true) {
          this.groupTrashMessages();
        }
      }, 500);
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
      let selectedTab: any = $('.feature_tab .active a').text().trim();
      setTimeout(() => {
        this.groupStarredMessages();
      }, 1000);
    });
  }

  clickMessages(id: number, esdb_id: string) {
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.replyMsgSubmitted = false;
    $('.widget-app-content').removeClass('highlight');
    this.selectedMessage = [];
    if (this.groupMessage && this.groupMessage.length > 0) {
      this.groupMessage.forEach((val, index) => {
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
    this.getGroup();
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
    this.selectedMessage = [];
    this.authService.setLoader(true);
    this.replyMsgSubmitted = false;
    $('.widget-app-content').removeClass('highlight');
    this.selectedMessage = [];
    if (this.groupMessage && this.groupMessage.length > 0) {
      this.groupMessage.forEach((val, index) => {
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
    let toGroup: { id: any; name: string }[] = [];
    if (this.selectedMessage[0].group) {
      toGroup.push({
        id: this.selectedMessage[0].group.id,
        name: this.selectedMessage[0].group.name,
      });
    }
    this.messageForm.controls['kind'].setValue('group');
    this.messageForm.controls['subject'].setValue(this.selectedMessage[0].subject);
    this.messageForm.controls['content'].setValue(this.selectedMessage[0].content);
    this.messageForm.controls['kind_id'].setValue(toGroup);
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
          setTimeout(() => {
            if (this.groupInbox == true) {
              this.groupMessages();
            } else if (this.groupStarred == true) {
              this.groupStarredMessages();
            } else if (this.groupSent == true) {
              this.groupSentMessages();
            } else if (this.groupDrafts == true) {
              this.groupDraftsMessages();
            } else if (this.groupAllMail == true) {
              this.groupAllMailMessages();
            } else if (this.groupTrash == true) {
              this.groupTrashMessages();
            }
          }, 500);
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
            this.groupTrashMessages();
          }, 500);
        });
      },
      () => {}
    );
  }

  replyToMessages(messageId: number, esdb_id: string, groupId) {
    this.isReplyMsgForm = true;
    this.singleParticipent = true;
    this.multipleParticipent = false;
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + groupId, null).subscribe((respData: any) => {
      this.receipientUsers = respData.participants;
      setTimeout(() => {
        $('#reply-heading').text('Reply');
        $('#replyMsgType').val('reply');
        $('#replyToMsgId').val(esdb_id);
      }, 500);
    });
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
          setTimeout(() => {
            if (this.groupInbox == true) {
              this.groupMessages();
            } else if (this.groupStarred == true) {
              this.groupStarredMessages();
            } else if (this.groupSent == true) {
              this.groupSentMessages();
            } else if (this.groupDrafts == true) {
              this.groupDraftsMessages();
            } else if (this.groupAllMail == true) {
              this.groupAllMailMessages();
            } else if (this.groupTrash == true) {
              this.groupTrashMessages();
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
          setTimeout(() => {
            if (this.groupInbox == true) {
              this.groupMessages();
            } else if (this.groupStarred == true) {
              this.groupStarredMessages();
            } else if (this.groupSent == true) {
              this.groupSentMessages();
            } else if (this.groupDrafts == true) {
              this.groupDraftsMessages();
            } else if (this.groupAllMail == true) {
              this.groupAllMailMessages();
            } else if (this.groupTrash == true) {
              this.groupTrashMessages();
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
          selectAllText: 'Select All',
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
    this.messageSubmitted = true;
    if (this.messageForm.valid) {
      let groupIds: any;
      if (this.messageForm.controls['kind_id'].value.length > 0) {
        this.messageForm.controls['kind_id'].value.forEach((val, index) => {
          groupIds = val.id;
        });
      }
      var formData: FormData = new FormData();
      this.messageForm.controls['receiver_id'].setValue(this.receiverUser);
      this.messageForm.controls['cc'].setValue(this.ccUser);
      this.messageForm.controls['kind_id'].setValue(groupIds);
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
      this.authService.memberSendRequest('post', 'message/send-group-message', formData).subscribe(
        (respData: any) => {
          this.messageSubmitted = false;
          if (respData['isError'] == false) {
            this.responseMessage = respData['result'];
            this.notificationService.showSuccess(this.responseMessage, 'Success');

            this.messageForm.reset();
            this.messageForm.controls['kind'].setValue([]);
            this.messageForm.controls['receiver_id'].setValue([]);
            this.messageForm.controls['cc'].setValue([]);
            this.authService.memberSendRequest('delete', 'message/delete-draft/' + this.selectedMessage[0].id, null).subscribe((respData: any) => {
              this.authService.setLoader(false);
              this.notificationService.showSuccess(this.language.community_messages.message_sent, 'Success');
              setTimeout(() => {
                this.groupDraftsMessages();
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
      this.language.confirmation_message.delete_msg,
      () => {
        this.selectedMessage = [];
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'message/delete-draft/' + messageId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.responseMessage = this.language.community_messages.permanently_delete;
          this.notificationService.showSuccess(this.responseMessage, 'Success');
          let selectedTab: any = $('.feature_tab .active a').text().trim();
          setTimeout(() => {
            this.groupDraftsMessages();
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
