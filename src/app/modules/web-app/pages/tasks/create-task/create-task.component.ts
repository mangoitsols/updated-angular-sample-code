import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray, UntypedFormControl, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CommunityGroup, LoginDetails, ThemeType, UserDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService, WeekdaysService } from '@core/services';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

declare var $: any;

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css'],
  providers: [DatePipe],
})
export class CreateTaskComponent implements OnInit, OnDestroy {
  language: any;
  organizer_id: any;
  submitted: boolean = false;
  user_dropdown: { id: number; user_email: string; user_name: string }[] = [];
  group_dropdown: CommunityGroup[];
  groupDropdownSettings: IDropdownSettings;
  type_visibility: number;
  type_dropdown: { id: number; name: string }[] = [];
  typeDropdownSettings: IDropdownSettings;
  subTaskUserDropdownSettings: IDropdownSettings;
  subTaskGroupUserDropdownSettings: IDropdownSettings;
  subTaskSelectedUser: any[] = [];
  receiveData: UserDetails;
  userDetails: LoginDetails;
  showUsers: boolean;
  participantSelectedItem: number[] = [];
  participantSelectedToShow: { id: number; user_name: string }[] = [];
  participantDropdownSettings: IDropdownSettings;
  showSubtasks: boolean = true;
  collaboratorList: UntypedFormArray;
  subtaskList: UntypedFormArray;
  teamId: number;
  setTheme: ThemeType;
  createTaskForm: UntypedFormGroup;
  imageChangedEvent: Event = null;
  croppedImage: string = '';
  file: File;
  fileToReturn: File;
  private activatedSub: Subscription;
  dateError: boolean = false;
  indax: number;
  groupParticipants: any[] = [];
  subTaskVisibility: number;
  author_id: number = 0;
  isImage: boolean = false;
  imgHeight: any;
  imgWidth: any;
  breadCrumbItems: Array<BreadcrumbItem>;

  tagsName: any[] = [];
  tagCtrl = new FormControl('');
  filteredTags: Observable<any[]>;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  allTags: any[] = [];
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: any;
  removable = true;
  imageFile: File;
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
    private datePipe: DatePipe,
    private weekDayService: WeekdaysService
  ) {}

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    maxHeight: '15rem',
    translate: 'no',
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
    sanitize: true,
    toolbarPosition: 'top',
    defaultFontName: 'Arial',
    defaultFontSize: '2',
    defaultParagraphSeparator: 'p',
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
    $('#subtask').hide();
    $('#showSubtask').hide();

    this.organizer_id = localStorage.getItem('user-id');
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.teamId = this.userDetails.team_id;
    this.getUserAndGroup();
    this.initBreadcrumb();

    this.type_dropdown = this.weekDayService.type_dropdown();

    this.typeDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
      closeDropDownOnSelection: true,
    };
    this.subTaskUserDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'user_name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
    };
    this.subTaskGroupUserDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'user_name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
    };
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
    this.groupDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: this.language.header.search,
      closeDropDownOnSelection: true,
    };
    this.createTaskForm = this.formBuilder.group({
      add_image: ['null'],
      title: ['', [Validators.required, this.noWhitespace]],
      description: ['', Validators.required],
      organizer_id: [localStorage.getItem('user-id')],
      status: ['1'],
      groups: [''],
      group_id: [''],
      date: ['', Validators.required],
      type_dropdown: ['', Validators.required],
      user_participant: [''],
      collaborators: this.formBuilder.array([]),
      subtasks: this.formBuilder.array([]),
      tags: this.formBuilder.array([]),
    });
    this.collaboratorList = this.createTaskForm.get('collaborators') as UntypedFormArray;
    this.subtaskList = this.createTaskForm.get('subtasks') as UntypedFormArray;

    this.getAllTags();
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice()))
    );
  }

  // --------------------------SubTaskList------------------------
  get subtaskFormGroup() {
    return this.createTaskForm.get('subtasks') as UntypedFormArray;
  }

  /**
   * Function is used create controls for the Subtask
   * @author  MangoIt Solutions
   * @param   {}
   * @return  error message if file type is not image
   */
  createSubtask(): UntypedFormGroup {
    return this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, this.noWhitespace])],
      description: ['', Validators.compose([Validators.required])],
      assigned_to: ['', Validators.compose([Validators.required])],
      status: [0],
      date: ['', Validators.compose([Validators.required])],
    });
  }

  /**
   * Function is used to add sub task
   * @author  MangoIt Solutions
   */
  addSubtask() {
    $('#showSubtask').show();
    if ($('#showSubtask').is(':visible')) {
      if (this.subtaskList?.value?.length > 0) {
        if (this.subtaskList?.controls) {
          this.subtaskList?.controls.forEach(element => {
            if (element.status == 'VALID') {
              this.showSubtasks = true;
            } else {
              this.showSubtasks = false;
            }
          });
        }
      }
      if (this.showSubtasks == true) {
        this.subtaskList.push(this.createSubtask());
      }
    }
  }

  /**
   * Function is used to remove sub task
   * @author  MangoIt Solutions
   */
  removeSubtask(index: number) {
    this.subtaskList.removeAt(index);
  }

  getSubtasksFormGroup(index: number): UntypedFormGroup {
    const formGroup: UntypedFormGroup = this.subtaskList.controls[index] as UntypedFormGroup;
    return formGroup;
  }

  /**
   * Function is used to select sub task user
   * @author  MangoIt Solutions
   */
  onSubTaskUserSelect(item: { id: number; user_name: string }[], i: number) {
    this.subTaskSelectedUser.push(item['id']);
  }

  /**
   * Function is used to de select sub task user
   * @author  MangoIt Solutions
   */
  onSubTaskUserDeSelect(item: { id: number; user_name: string }[], i: number) {
    if (this.subTaskSelectedUser && this.subTaskSelectedUser.length > 0) {
      this.subTaskSelectedUser.forEach((value, index) => {
        if (value == item['id']) {
          this.subTaskSelectedUser.splice(index, 1);
        }
      });
    }
  }

  get collaboratorFormGroup() {
    return this.createTaskForm.get('collaborators') as UntypedFormArray;
  }

  /**
   * Function is used to add Collaborator
   * @author  MangoIt Solutions
   */
  addCollaborator(id: number) {
    this.collaboratorList.push(this.createCollaborator(id));
  }

  /**
   * Function is used to create Collaborator
   * @author  MangoIt Solutions
   */
  createCollaborator(id: number): UntypedFormGroup {
    return this.formBuilder.group({
      user_id: [id, Validators.compose([Validators.required])],
      approved_status: [1, Validators.compose([Validators.required])],
    });
  }

  /**
   * Function is used to remove Collaborator
   * @author  MangoIt Solutions
   */
  removeCollaborator(index: number) {
    this.collaboratorList.removeAt(index);
  }

  /**
   * Function to add selected users from the dropdown
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all  approved Group Users list
   */
  onUserSelect(item: { id: number; user_name: string }) {
    this.showUsers = true;
    this.participantSelectedToShow.push(item);
    this.participantSelectedItem.push(item.id);
    this.addCollaborator(item.id);
  }

  /**
   * Function to remove selected users from the dropdown
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all  approved Group Users list
   */
  onUserDeSelect(item: { id: number; user_name: string }) {
    if (this.createTaskForm.get('collaborators').value) {
      this.createTaskForm.get('collaborators').value.forEach((value, index) => {
        if (value.user_id == item.id) {
          this.removeCollaborator(index);
        }
      });
    }
    if (this.participantSelectedToShow) {
      this.participantSelectedToShow.forEach((value, index) => {
        if (value.id == item.id) {
          this.participantSelectedToShow.splice(index, 1);
        }
      });
    }
    if (this.participantSelectedItem) {
      this.participantSelectedItem.forEach((value, index) => {
        if (value == item.id) {
          this.participantSelectedItem.splice(index, 1);
        }
      });
    }
  }

  /**
   * Function is used to get user and Groups
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all user and Group list
   */
  getUserAndGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamGroupsAndUsers/' + this.teamId, null).subscribe((respData: any) => {
        if (respData['isError'] == false) {
          this.authService.setLoader(false);
          if (respData && respData?.result?.groups?.length > 0) {
            this.group_dropdown = respData.result.groups;
          }
          if (respData && respData?.result?.users?.length > 0) {
            this.receiveData = respData.result.users;
            Object(respData.result.users).forEach((val, key) => {
              if (val.role != 'guest') {
                this.user_dropdown.push({
                  id: val.id,
                  user_email: val.username,
                  user_name: val.firstname + ' ' + val.lastname + ' (' + val.username + ' )',
                });
              }
            });
          }
        }
      });
    }
  }

  /**
   * Function for creating a Task
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all the Groups
   */
  onCreateTask() {
    this.submitted = true;
    this.createTaskForm.controls['date'].setValue(this.formatDate(this.createTaskForm.controls['date'].value));
    if (sessionStorage.getItem('token')) {
      for (const key in this.createTaskForm.value) {
        if (Object.prototype.hasOwnProperty.call(this.createTaskForm.value, key)) {
          const element: any = this.createTaskForm.value[key];
          if ((element == '' || (element && element.length == 0)) && key != 'subtasks') {
            this.createTaskForm.value[key] = null;
          }
        }
      }

      if (this.createTaskForm.get('subtasks').value.length) {
        var subtaskDetails = this.createTaskForm.get('subtasks').value;
        if (subtaskDetails?.length > 0) {
          subtaskDetails.forEach((value, index) => {
            var assigned: any[] = [];
            if (value.assigned_to?.length > 0) {
              value.assigned_to.forEach((elem: any) => {
                assigned.push({ user_id: elem.id, approved_status: 1 });
              });
              subtaskDetails[index].assigned_to = [];
              subtaskDetails[index].assigned_to = assigned;
            }
            subtaskDetails[index].date = this.formatDate(subtaskDetails[index].date);
          });
        }
        this.createTaskForm.controls['subtasks'].setValue(subtaskDetails);
      }
      if (this.createTaskForm.valid && this.dateError == false) {
        if (this.createTaskForm.get('groups')?.value?.length) {
          var groupId: number = this.createTaskForm.get('groups').value[0].id;
          this.createTaskForm.get('group_id').setValue(groupId);
          this.authService.setLoader(false);
          if (this.groupParticipants?.length > 0) {
            this.groupParticipants.forEach((value, index) => {
              if (value.id == this.organizer_id) {
                this.author_id = 1;
                this.addCollaborator(value.id);
              } else {
                this.addCollaborator(value.id);
              }
            });
          }
          if (this.author_id == 0) {
            this.addCollaborator(this.organizer_id);
          }
          this.submitTask();
        } else {
          this.createTaskForm.get('group_id').setValue(0);
          if (this.createTaskForm.get('collaborators')) {
            this.createTaskForm.get('collaborators').value.forEach(element => {
              if (element.user_id == this.organizer_id) {
                this.author_id = 1;
              }
            });
          }
          if (this.author_id == 0) {
            this.addCollaborator(this.organizer_id);
          }
          this.submitTask();
        }
      }
    }
  }

  /**
   * Function for submit the Task
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all the Groups
   */
  submitTask() {
    this.createTaskForm.removeControl('type_dropdown');
    this.createTaskForm.removeControl('user_participant');
    this.createTaskForm.removeControl('groups');
    this.createTaskForm.value.team_id = this.teamId;
    var formData: FormData = new FormData();
    for (const key in this.createTaskForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.createTaskForm.value, key)) {
        const element: any = this.createTaskForm.value[key];
        if (key == 'collaborators') {
          var uniqueUsers = this.authService.uniqueData(element);
          formData.append('collaborators', JSON.stringify(uniqueUsers));
        }
        if (key == 'date') {
          formData.append('date', this.formatDate(element));
        }
        if (key == 'description') {
          formData.append('description', element);
        }
        if (key == 'group_id') {
          formData.append('group_id', element);
        }
        if (key == 'organizer_id') {
          formData.append('organizer_id', element);
        }
        if (key == 'status') {
          formData.append('status', element);
        }
        if (key == 'subtasks') {
          element.forEach((ele: any, idn: any) => {
            ele.date = this.formatDate(ele.date);
          });
          formData.append('subtasks', JSON.stringify(element));
        }
        if (key == 'add_image') {
          formData.append('file', element);
        }
        if (key == 'title') {
          formData.append('title', element);
        }
        if (key == 'tags') {
          formData.append('task_tags', JSON.stringify(element));
        } else {
          if (key != 'collaborators' && key != 'date' && key != 'description' && key != 'group_id' && key != 'organizer_id' && key != 'status' && key != 'subtasks' && key != 'title' && key != 'add_image' && key != 'tags')
            formData.append(key, element);
        }
      }
    }
    this.authService.setLoader(true);
    this.authService.memberSendRequest('post', 'createTask', formData).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.socket.emit('sendNotification', 'Task', (error: any) => {});

        this.notificationService.showSuccess(respData['result']['message'], 'Success');
        setTimeout(() => {
          var redirectUrl: string = '/web/tasks/organizer-task';
          this.router.navigate([redirectUrl]);
        }, 2000);
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  /**
   * Function to select task type from the dropdown
   * @author  MangoIt Solutions
   * @param   {typeId, type Name}
   * @return  {Array Of Object}
   */
  onTypeSelect(item: { id: number; name: string }) {
    this.type_visibility = item.id;
    this.subTaskVisibility = item.id;
    this.showUsers = false;
    this.subTaskSelectedUser = [];
    this.participantSelectedToShow = [];
    (<UntypedFormArray>this.createTaskForm.get('collaborators')).clear();
    this.createTaskForm.controls['user_participant'].setValue([]);
    this.createTaskForm.controls['group_id'].setValue([]);
    this.createTaskForm.controls['groups'].setValue([]);
    this.createTaskForm.controls['subtasks'].reset();
    if (this.type_visibility == 1) {
      this.createTaskForm.get('groups').setValidators(Validators.required);
      this.createTaskForm.get('groups').updateValueAndValidity();
      this.createTaskForm.get('user_participant').clearValidators();
      this.createTaskForm.get('user_participant').updateValueAndValidity();
    } else {
      this.createTaskForm.get('user_participant').setValidators(Validators.required);
      this.createTaskForm.get('user_participant').updateValueAndValidity();
      this.createTaskForm.get('groups').clearValidators();
      this.createTaskForm.get('groups').updateValueAndValidity();
    }
  }

  /**
   * Function to remove task type from the dropdown
   * @author  MangoIt Solutions
   * @param   {typeId, type Name}
   * @return  {}
   */
  onTypeDeSelect(item: { id: number; name: string }) {
    this.type_visibility = null;
    this.showUsers = false;
    this.participantSelectedToShow = [];
    (<UntypedFormArray>this.createTaskForm.get('collaborators')).clear();
    this.createTaskForm.controls['user_participant'].setValue([]);
    this.createTaskForm.controls['group_id'].setValue([]);
    this.createTaskForm.controls['groups'].setValue([]);
  }

  /**
   * Function to get all approved Group Users list
   * @author  MangoIt Solutions
   * @param   {groupId, Group Name}
   * @return  {Array Of Object} all  approved Group Users list
   */
  onGroupSelect(item: { id: number; name: string }) {
    this.groupParticipants = [];
    this.authService.memberSendRequest('get', 'approvedGroupUsers/group/' + item.id, null).subscribe((respData: any) => {
      if (respData && respData.participants.length > 0) {
        respData.participants.forEach((value, index) => {
          if (value.approved_status == 1) {
            if (value.groupusers) {
              value.groupusers.forEach(elem => {
                this.groupParticipants.push({
                  id: elem.id,
                  user_email: elem.email,
                  user_name: elem.firstname + ' ' + elem.lastname + ' (' + elem.email + ' )',
                });
              });
            }
          }
        });
      }
    });
  }

  /**
   * Function for remove the selected group from the dropdown
   * @author  MangoIt Solutions
   * @param   {groupId, Group Name}
   * @return  {}
   */
  onGroupDeSelect(item: { id: number; name: string }) {
    (<UntypedFormArray>this.createTaskForm.get('collaborators')).clear();
    this.createTaskForm.controls['user_participant'].setValue([]);
    this.createTaskForm.controls['group_id'].setValue([]);
    this.createTaskForm.controls['groups'].setValue([]);
  }

  /**
   * Function is used to get today date
   * @author  MangoIt Solutions
   */
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Function is used to remove blank space
   * @author  MangoIt Solutions
   */
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

  /**
   * Function to check date
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {boolean} true;
   */
  checkDate(item: any) {
    this.indax = item;
    if (this.createTaskForm.value['subtasks']) {
      this.createTaskForm.value['subtasks'].forEach((element, key) => {
        if (this.formatDate(element.date) > this.formatDate(this.createTaskForm.value['date'])) {
          this.dateError = true;
          return this.indax;
        } else {
          this.dateError = false;
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
        this.createTaskForm.patchValue({ add_image: this.fileToReturn });
        this.createTaskForm.get('add_image').updateValueAndValidity();
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
    // window.history.back();
    this.router.navigate(['/web/tasks/organizer-task']);
  }

  /**
   * Function is used to get tags data
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} get all tags
   */
  getAllTags() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'tags?type=task', null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        this.authService.setLoader(false);
        if (respData && respData?.result) {
          this.tags = respData['result'];
          if (this.tags && this.tags.length) {
            this.tags.forEach((val: any, key: any) => {
              this.allTags.push({
                id: val.id,
                name: val.tag_name,
              });
            });
          }
        }
      }
    });
  }

  /**
   * Function is used to add tags
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  addTags(event: MatChipInputEvent): void {
    const formArray: FormArray = this.createTaskForm.get('tags') as FormArray;
    const value = (event.value || '').trim();

    // Add our tag
    if (value && !this.tagsName.includes(value)) {
      this.tagsName.push(value);
      formArray.push(new FormControl(value));
      formArray.updateValueAndValidity();
    }

    // Clear the input value
    event.chipInput!.clear();
    this.tagCtrl.setValue(null);
  }

  /**
   * Function is used to remove tags
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  remove(tag: string): void {
    const formArray: FormArray = this.createTaskForm.get('tags') as FormArray;
    const index = this.tagsName.indexOf(tag);
    if (index >= 0) {
      this.tagsName.splice(index, 1);
      formArray.removeAt(index);
      formArray.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event && event.option && event.option.viewValue) {
      const formArray: any = this.createTaskForm.get('tags') as FormArray;

      if (event.option.viewValue && !this.tagsName.includes(event.option.viewValue)) {
        this.tagsName.push(event.option.viewValue);
        formArray.push(new FormControl(event.option.viewValue));
      }
      this.tagInput.nativeElement.value = '';
      this.tagCtrl.setValue(null);
    }
  }

  private _filter(value: any): any[] {
    if (typeof value == 'string') {
      const filterValue = value.toLowerCase();
      return this.allTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
    } else {
      const filterValue = value.name.toLowerCase();
      return this.allTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
    }
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: this.language.menu.organizer, link: '/web/organizer' }, { label: this.language.create_task.create_task }];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }

  private formatDate(date: Date): any {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
