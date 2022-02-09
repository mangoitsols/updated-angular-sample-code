import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../../../service/language.service';
declare var $: any;

@Component({
  selector: 'app-create-news',
  templateUrl: './create-news.component.html',
  styleUrls: ['./create-news.component.css'],
  providers: [DatePipe]
})
export class CreateNewsComponent implements OnInit {
  language;
  submitted = false;
  createNewsForm: FormGroup;
  responseMessage = null;
  visiblity = [];
  groupVisiblity;
  visiblityDropdownSettings;
  groups;
  groupSelectedItem = [];
  groupDropdownSettings;
  dropdownList;
  dropdownSettings;

  constructor(
    private authService: AuthServiceService,
    private router: Router,
    public formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private lang: LanguageService
  ) { }

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
        'insertVideo'
      ]
    ]
  };

  ngOnInit(): void {
    this.language = this.lang.getLanguaageFile();
    this.getGroup();
    if (localStorage.getItem('create-message'))
      localStorage.removeItem('create-message');
    this.visiblity = [
      { "id": "0", "name": this.language.create_news.visible_everyone },
      { "id": "2", "name": this.language.create_news.visible_group }
    ];

    this.visiblityDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText:this.language.header.search
    };

    this.groupDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText:this.language.header.search
    };

    this.createNewsForm = this.formBuilder.group({
      title: ['', [Validators.required, this.noWhitespace]],
      content: ['', Validators.required],
      add_image: ['', Validators.required],
      visible_dropdown: ['', Validators.required],
      group_dropdown: [''],
      show_guest: ['']
    });
  }

  noWhitespace(control: FormControl) {
    if(control.value.length != 0){
      let isWhitespace = (control.value || '').trim().length === 0;
      let isValid = !isWhitespace;
      return isValid ? null : { 'whitespace': true }
    }
    else{
      let isValid = true;
      return isValid ? null : { 'whitespace': true }
    }
  }



  onVisiblitySelect(item: any) {
    this.groupVisiblity = item.id;
    if (this.groupVisiblity == "2") {
      this.createNewsForm.get('group_dropdown').setValidators(Validators.required);
      this.createNewsForm.get('group_dropdown').updateValueAndValidity();
    }
    else {
      this.createNewsForm.get('group_dropdown').clearValidators();
      this.createNewsForm.get('group_dropdown').updateValueAndValidity();
    }
  }

  onGroupItemSelect(item: any) {
    this.groupSelectedItem.push(item.id);
  }

  onGroupItemDeSelect(item: any) {
    this.groupSelectedItem.push(item.id);
    const index = this.groupSelectedItem.indexOf(item.id);
    if (index > -1) {
      this.groupSelectedItem.splice(index, 1);
    }
  }

  getGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamgroups/1', null)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.groups = respData;
          }
        );
    }
  }

  onCancel() {
    window.history.back();
  }

  errorImage: any = { isError: false, errorMessage: '' };
  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];    
    const mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.errorImage = {
        isError: true, errorMessage: this.language.error_message.common_valid
      };
    }
    else{
      this.errorImage = { Error: true, errorMessage: ''};
      this.createNewsForm.patchValue({
        add_image: file
      });
      this.createNewsForm.get('add_image').updateValueAndValidity();
    }
    const reader = new FileReader();
    var imagePath = file;
    reader.readAsDataURL(file);
    var url;
    let self = this;
    reader.onload = (_event) => {
      url = reader.result;

  var imagee = new Image();
      imagee.src = URL.createObjectURL(file);

      imagee.onload = (e: any) => {
		  
        const imagee = e.path[0] as HTMLImageElement;
        console.log(imagee.height);
        console.log(imagee.width);
        var imgHeight = imagee.height
        var imgWidth = imagee.width
        if ((imgHeight >= 1000 && imgHeight <= 1100) && (imgWidth >= 1000 && imgWidth <= 1100)) {
          $('.preview_img').attr('src', url);
        }
        else {
          self.errorImage = { isError: true, errorMessage: 'width and Height Should be in 1080px * 1080px' };
        }
      }
    }
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);
  }

  createNews() {
    this.submitted = true;
    if ((sessionStorage.getItem('token')) && (this.createNewsForm.valid) && (!this.errorImage.isError)) {
      this.authService.setLoader(true);
      var team_id = 1;
      var priority = 1;
      var audience = this.groupVisiblity;
      var userDetails = JSON.parse(localStorage.getItem('user-data'));
      let userRole = userDetails.roles[0];
      if (userRole == 'admin') {
        var approved_statud = 1;
      }
      else {
        var approved_statud = 0;
      }
      var publication_date_from = new Date().toISOString();
      var tags = null;
      var attachment = null;
      var show_guest: string = this.createNewsForm.get('show_guest').value;

      var data = [];
      data['team_id'] = team_id;
      data['title'] = this.createNewsForm.get('title').value;
      data['headline'] = this.createNewsForm.get('content').value;
      data['text'] = this.createNewsForm.get('content').value;
      data['author'] = localStorage.getItem('user-id');
      data['priority'] = priority;
      data['attachment'] = attachment;
      data['tags'] = tags;
      data['audience'] = audience;
      data['approved_statud'] = approved_statud;
      data['groups'] = this.groupSelectedItem;
      if(show_guest){
        data['show_guest_list'] = show_guest.toString();
      }
      else{
        data['show_guest_list'] = false;
      }
      data['publication_date_to'] = new Date().toISOString();
      data['publication_date_from'] = new Date().toISOString();

      var arrayToString = JSON.stringify(Object.assign({}, data));

      var dataToApi = JSON.parse(arrayToString);

      var formData: any = new FormData();
      formData.append("file", this.createNewsForm.get('add_image').value);
      console.log(formData.get('file'));
    
      formData.append("team_id", team_id);
      formData.append("title", this.createNewsForm.get('title').value);
      formData.append("headline", this.createNewsForm.get('content').value);
      formData.append("text", this.createNewsForm.get('content').value);
      formData.append("author", localStorage.getItem('user-id'));
      formData.append("priority", priority);
      if ((attachment == null) || (tags == null)) {
        formData.append("attachment", attachment);
        formData.append("tags", tags);
      }
      formData.append("audience", audience);
      formData.append("approved_statud", approved_statud);
      if (this.groupSelectedItem.length) {
        formData.append("groups", "[" + this.groupSelectedItem + "]");
      }
      if(show_guest){
        formData.append("show_guest_list", show_guest.toString());
      }
      else{
        // data['show_guest_list'] = false;
        formData.append("show_guest_list", false);
      }
      formData.append("publication_date_to", new Date().toISOString());
      formData.append("publication_date_from", new Date().toISOString());
      this.authService.setLoader(true);
    
      this.authService.memberSendRequest('post', 'createNews', formData)
        .subscribe(
          (respData) => {
            this.authService.setLoader(false);
            this.submitted = false;
            if (respData['isError'] == false) {
              this.responseMessage = respData['result']['message'];
              if(respData['result']['message'] == "News succesfully created"){
                this.responseMessage = this.language.response_message.news_success;
              }
              this.groupVisiblity = '';
              var url = 'assets/img/event_upload.png';
              $('.preview_img').attr('src', url);
              $('.preview_txt').hide();
              $('.preview_txt').text('');
              var self = this;
              setTimeout(function(){
                self.router.navigate(['clubwall']);
              }, 3000);
            }
            if (respData['code'] == 400) {
              this.responseMessage = respData['message'];
              if(respData['result']['message'] == "Already exist"){
                this.responseMessage = this.language.response_message.news_already_exist;
              }
            }
          },
          (err) => {
            console.log("ERROR");
            console.log(err);
          }
        );
    }
  }

}
