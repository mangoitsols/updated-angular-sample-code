import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { NgxImageCompressService } from 'ngx-image-compress';
import { LoginDetails, ThemeType, UserDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css'],
})
export class CreateGroupComponent implements OnInit, OnDestroy {
  language: any;
  submitted: boolean = false;
  userDetails: LoginDetails;
  createGroupForm: UntypedFormGroup;
  showParticipants: boolean = false;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  file: File;
  fileToReturn: File;
  setTheme: ThemeType;
  participantDropdownSettings: IDropdownSettings;
  receiveData: UserDetails[] = [];
  participant: { id: number; user_email: string; user_name: string }[] = [];
  participantList: { user_id: number; approved_status: number }[] = [];
  participantSelectedItem: number[] = [];
  participantSelectedToShow: { id: any; user_name: string }[] = [];
  private activatedSub: Subscription;
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  breadcrumbs: BreadcrumbItem[] = [];
  imageFile: File;
  alluserInformation = [];
  user_dropdown: { id: number; user_email: string; user_name: string }[] = [];
  thumb: any;
  socket: Socket;

  constructor(
    private authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    private router: Router,
    private lang: LanguageService,
    private themes: ThemeService,
    public navigation: NavigationService,
    private notificationService: NotificationService,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
    private sanitizer: DomSanitizer
  ) {}

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    translate: 'no',
    sanitize: true,
    toolbarPosition: 'top',
    defaultFontName: 'Arial',
    defaultFontSize: '2',
    defaultParagraphSeparator: 'p',
    fonts: [{ class: 'gellix', name: 'Gellix' }],
    toolbarHiddenButtons: [
      [
        'link',
        'unlink',
        'subscript',
        'superscript',
        'insertUnorderedList',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
        'insertImage',
        'insertVideo',
        'italic',
        'fontSize',
        'undo',
        'redo',
        'underline',
        'strikeThrough',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'heading',
        'textColor',
        'backgroundColor',
        'customClasses',
        'insertOrderedList',
        'fontName',
      ],
    ],
  };

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.getUsers();
    this.initBreadcrumb();
    this.participantDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'user_name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
    };

    this.createGroupForm = this.formBuilder.group({
      name: ['', [Validators.required, this.noWhitespace]],
      description: ['', Validators.required],
      add_image: ['null'],
      created_by: [localStorage.getItem('user-id')],
      team_id: [''],
      approved_status: [''],
      participants: ['', Validators.required],
      isPrivate: [''],
    });
  }

  noWhitespace(control: UntypedFormControl) {
    if (control.value && control.value.length != 0) {
      let isWhitespace: boolean = (control.value || '').trim().length === 0;
      let isValid: boolean = !isWhitespace;
      return isValid ? null : { whitespace: true };
    } else {
      let isValid: boolean = true;
      return isValid ? null : { whitespace: true };
    }
  }

  getUsers() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
        this.receiveData = respData;
        this.authService.setLoader(false);
        if (respData?.length > 0) {
          this.alluserInformation = [];

          Object(respData).forEach((val, key) => {
            this.alluserInformation[val.id] = { member_id: val.member_id };

            if (val.role != 'guest') {
              this.participant.push({
                id: val.id,
                user_email: val.email,
                user_name: val.firstname + ' ' + val.lastname + ' (' + val.email + ' )',
              });
            }
            if (val.id != localStorage.getItem('user-id') && val.role != 'guest') {
              this.user_dropdown.push({
                id: val.id,
                user_email: val.email,
                user_name: val.firstname + ' ' + val.lastname + ' (' + val.email + ' )',
              });
            }
          });
        }
      });
    }
  }

  /**
   * Function is used to select Participant
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  onParticipantSelect(item: { id: number; user_name: string }) {
    this.showParticipants = true;
    this.participantSelectedToShow.push(item);
    this.participantSelectedItem.push(item.id);

    this.participantSelectedToShow = this.participantSelectedToShow.filter((participant, index, self) => index === self.findIndex(p => p.id === participant.id));

    if (this.participantSelectedToShow?.length > 0) {
      Object(this.participantSelectedToShow).forEach((valu, key) => {
        if (this.alluserInformation && this.alluserInformation[valu.id] && this.alluserInformation[valu.id].member_id != null) {
          valu.image = this.alluserInformation[valu.id].member_id;
        } else {
          valu.image = null;
        }
      });
    }
  }

  /**
   * Function is used to DeSelect Participant
   * @author  MangoIt Solutions
   * @param   {}
   * @return {}
   */
  onParticipantDeSelect(item: { id: number; user_name: string }) {
    this.participantSelectedToShow.forEach((value, index) => {
      if (value.id == item.id) {
        this.participantSelectedToShow.splice(index, 1);
      }
    });

    if (this.participantSelectedItem && this.participantSelectedItem.length > 0) {
      this.participantSelectedItem.forEach((value, index) => {
        if (value == item.id) {
          this.participantSelectedItem.splice(index, 1);
        }
      });
    }
  }

  /**
   * Function is used to create group and send data in formData formate in API
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {string} return success message
   */
  createGroup() {
    this.submitted = true;
    if (sessionStorage.getItem('token') && this.createGroupForm.valid && !this.errorImage.isError) {
      let status: number = 0;
      if (this.userDetails.roles[0] == 'admin') {
        status = 1;
      }
      if (this.participantSelectedItem?.length > 0) {
        this.participantSelectedItem.forEach((value, index) => {
          this.participantList.push({ user_id: value, approved_status: status });
        });
      }

      if (this.participantList && this.participantList.length > 0) {
        this.participantList.push({ user_id: parseInt(this.userDetails.userId), approved_status: 1 });
      }
      this.createGroupForm.get('participants').setValue(this.participantList);
      this.createGroupForm.controls['team_id'].setValue(this.userDetails.team_id);
      var formData: FormData = new FormData();
      for (const key in this.createGroupForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.createGroupForm.value, key)) {
          const element: any = this.createGroupForm.value[key];
          if (key == 'add_image') {
            formData.append('file', element);
          }
          if (key == 'participants') {
            var userArr: { user_id: string; approved_status: number; keycloak_id: string }[] = [];
            if (element && element.length > 0) {
              element.forEach((value, key) => {
                var status: number = 1;
                if (value.user_id == localStorage.getItem('user-id')) {
                  status = 1;
                } else {
                  status = 1;
                }
                let res: UserDetails = this.receiveData.find(x => x.id == value.user_id);
                if (res) {
                  var userObj: { user_id: string; approved_status: number; keycloak_id: string } = {
                    user_id: value.user_id,
                    approved_status: status,
                    keycloak_id: res.keycloak_id,
                  };
                  userArr.push(userObj);
                }
              });
              // Filter out objects with duplicate user_id
              userArr = userArr.filter((obj, index, self) => index === self.findIndex(t => t.user_id === obj.user_id));

              var uniqueUsers = this.authService.uniqueData(userArr);

              formData.append('participants', JSON.stringify(uniqueUsers));
              formData.append('keycloak_id', this.userDetails.id);
            }
          }
          if (key == 'isPrivate') {
            let is_pvt;
            if (this.createGroupForm.value.isPrivate == true) {
              is_pvt = 1;
            } else if (this.createGroupForm.value.isPrivate == '') {
              is_pvt = 0;
            }
            formData.append('isPrivate', is_pvt);
          } else {
            if (key != 'add_image' && key != 'participants') formData.append(key, element);
          }
        }
      }

      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'createGroup', formData).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          this.socket.emit('sendNotification', 'Group', (error: any) => {});

          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          let groupId = respData['result']['group']['id'];
          var redirectUrl: string = `web/community/group/${groupId}/details/`;
          this.router.navigate([redirectUrl]);
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  /**
   * Function is used to validate file type is image and upload images
   * @author  MangoIt Solutions
   * @param   {}
   * @return  error message if file type is not image
   */
  errorImage: { isError: boolean; errorMessage: string } = { isError: false, errorMessage: '' };
  uploadFile(event: Event) {
    var file: File = (event.target as HTMLInputElement).files[0];
    this.imageFile = file;

    if (file) {
      const mimeType: string = file.type;
      if (mimeType.match(/image\/*/) == null) {
        this.errorImage = { isError: true, errorMessage: this.language.error_message.common_valid };
        this.croppedImage = '';
        this.imageChangedEvent = null;
        $('.preview_txt').hide();
        $('.preview_txt').text('');
        setTimeout(() => {
          this.errorImage = { isError: false, errorMessage: '' };
        }, 3000);
      } else {
        this.errorImage = { isError: false, errorMessage: '' };
        this.fileChangeEvent(event);
      }
    }
  }

  fileChangeEvent(event: Event): void {
    if (event && event.type == 'change') {
      this.croppedImage = '';
      this.imageChangedEvent = null;
      $('.preview_txt').hide();
      $('.preview_txt').text('');
      this.isImage = true;
    }
    this.imageChangedEvent = event;
    this.file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.imgWidth = img.width;
        this.imgHeight = img.height;
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(this.file);
  }

  /**
   * Function is used to cropped and compress the uploaded image
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  imageCropped(event: ImageCroppedEvent) {
    let imgData = this.commonFunctionService.getAspectRatio(this.imgHeight, this.imgWidth);
    this.croppedImage = event.base64;
    this.imageCompress
      .compressFile(this.croppedImage, -1, imgData[2], 100, imgData[0], imgData[1]) // 50% ratio, 50% quality
      .then(compressedImage => {
        this.fileToReturn = this.commonFunctionService.base64ToFile(compressedImage, this.imageChangedEvent.target['files'][0].name);
        this.createGroupForm.patchValue({ add_image: this.fileToReturn });
        this.createGroupForm.get('add_image').updateValueAndValidity();
        $('.preview_txt').show(this.fileToReturn.name);
        $('.preview_txt').text(this.fileToReturn.name);
      });
  }

  imageLoaded() {}

  cropperReady() {
    /* cropper ready */
    this.isImage = false;
  }

  loadImageFailed() {
    /* show message */
  }

  onCancel() {
    if (window.innerWidth < 768) {
      this.router.navigate(['/mobile/community/community-groups']);
    } else {
      this.router.navigate(['/web/community/groups']);
    }
  }

  private initBreadcrumb(): void {
    this.breadcrumbs = [
      { label: 'Community', link: '/web/community/groups' },
      {
        label: this.language.community.groups,
        link: '/web/community/groups',
      },
      { label: this.language.create_group.title, link: '' },
    ];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
