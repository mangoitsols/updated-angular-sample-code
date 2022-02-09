import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../../../service/language.service';;
declare var $: any;

@Component({
  selector: 'app-update-news',
  templateUrl: './update-news.component.html',
  styleUrls: ['./update-news.component.css'],
  providers: [DatePipe]
})
export class UpdateNewsComponent implements OnInit {
  language;
  userDetails;
  newsData;
  viewImage: boolean = false;
  submitted = false;
  updateNewsForm: FormGroup;
  responseMessage = null;
  visiblity = [];
  groupVisiblity;
  visiblityDropdownSettings;
  groups;
  groupSelectedItem = [];
  groupDropdownSettings;
  categories;
  categorySelectedItem = [];
  categoryDropdownSettings;
  dropdownList;
  dropdownSettings;
  newsid;
  errorImage: { isError: boolean; errorMessage: any; };
  createGroupForm: any;

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
    placeholder: 'Write your content here...',
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
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.route.params.subscribe(params => {
      this.newsid = params['newsid'];
      this.getNewsDetails(this.newsid);
    });

    this.getCategory();
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
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText:this.language.header.search
    };

    this.categoryDropdownSettings = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'id',
      textField: 'title',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText:this.language.header.search
    };

    this.updateNewsForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      add_image: [''],
      visible_dropdown: ['', Validators.required],
      group_dropdown: [''],
      category_dropdown: [''],
      show_guest: ['']
    });
  }

  onVisiblitySelect(item: any) {
 
    this.groupVisiblity = item.id;
    if (this.groupVisiblity == "2") {
      this.updateNewsForm.get('group_dropdown').setValidators(Validators.required);
      this.updateNewsForm.get('group_dropdown').updateValueAndValidity();
    }
    else {
      this.updateNewsForm.get('group_dropdown').clearValidators();
      this.updateNewsForm.get('group_dropdown').updateValueAndValidity();
    }
  }

  onGroupItemSelect(item: any) {
    this.groupSelectedItem.push(item.id);
  }

  onCategoryItemSelect(item: any) {
    this.categorySelectedItem.push(item.id);
  }

  getCategory() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'category', null)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            this.categories = respData;
          }
        );
    }
  }

  getGroup() {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'teamgroups/1', null)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            this.groups = respData;
          }
        );
    }
  }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    const mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.errorImage = {
        isError: true, errorMessage: this.language.error_message.common_valid
      };
    }
    else {
      this.errorImage = { isError: true, errorMessage: '' };
      this.updateNewsForm.patchValue({
        add_image: file
      });
      this.updateNewsForm.get('add_image').updateValueAndValidity();

    }
    const reader = new FileReader();
    var imagePath = file;
    var url;
    let self = this;
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      url = reader.result;
      // const canvas = document.createElement("canvas");
			// 	const imgHeight =canvas.height;
			// 	const imgWidth = canvas.width;
	
			// 	if((imgHeight >=1000 && imgHeight <= 1100) && (imgWidth >=1000 && imgWidth <=1100 )){
			// 		if (this.newsData.imageUrls) {
      //       $('#preview_img').attr('src', url);
      //     } else {
      //       $('.preview_img').attr('src', url);
      //     }
			// 	}
			// 	else{
			// 		self.errorImage = { isError: true, errorMessage: '"width and Height Shoud be in 1080px * 1080px"' };
			// 	}
      $('.preview_img').attr('src', url);
      
    }
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);
  }

  onCancel() {
    window.history.back();
  }

  updateNews() {
    this.submitted = true;
    if ((sessionStorage.getItem('token')) && (this.updateNewsForm.valid)) {
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
      var show_guest: string = this.updateNewsForm.get('show_guest').value;
      var data = [];
      data['team_id'] = team_id;
      data['title'] = this.updateNewsForm.get('title').value;
      data['headline'] = this.updateNewsForm.get('content').value;
      data['text'] = this.updateNewsForm.get('content').value;
      data['author'] = localStorage.getItem('user-id');
      data['priority'] = priority;
      data['attachment'] = attachment;
      data['tags'] = tags;
      data['audience'] = audience;
      data['approved_statud'] = approved_statud;
      data['groups'] = this.groupSelectedItem;
      if (show_guest) {
        data['show_guest_list'] = show_guest.toString();
      }
      else {
        data['show_guest_list'] = false;
      }
      data['publication_date_to'] = new Date().toISOString();
      data['publication_date_from'] = new Date().toISOString();
      var arrayToString = JSON.stringify(Object.assign({}, data));
      var dataToApi = JSON.parse(arrayToString);
      var formData: any = new FormData();
      formData.append("file", this.updateNewsForm.get('add_image').value);
      formData.append("team_id", team_id);
      formData.append("title", this.updateNewsForm.get('title').value);
      formData.append("headline", this.updateNewsForm.get('content').value);
      formData.append("text", this.updateNewsForm.get('content').value);
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
      if (show_guest) {
        formData.append("show_guest_list", show_guest.toString());
      }
      else {
        data['show_guest_list'] = false;
        formData.append("show_guest_list", false);
      }
      formData.append("publication_date_to", new Date().toISOString());
      formData.append("publication_date_from", new Date().toISOString());
      this.authService.setLoader(true);
      this.authService.memberSendRequest('put', 'news/' + this.newsData.id, formData)
        .subscribe(
          (respData) => {
            this.authService.setLoader(false);
            this.submitted = false;
            if (respData['isError'] == false) {
              this.responseMessage = respData['result']['message'];
              if (respData['result']['message'] == "News succesfully created") {
                this.responseMessage = this.language.response_message.news_success;
              }
              this.groupVisiblity = '';
              var url = 'assets/img/event_upload.png';
              $('.preview_img').attr('src', url);
              $('.preview_txt').hide();
              $('.preview_txt').text('');
              var self = this;
              setTimeout(function () {
                self.router.navigate(['clubwall']);
              }, 3000);
            }
            if (respData['code'] == 400) {
              this.responseMessage = respData['message'];
              if (respData['result']['message'] == "Already exist") {
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

  getNewsDetails(newsid) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-news-by-id/' + newsid, null)
        .subscribe(
          (respData: any) => {
            this.authService.setLoader(false);
            let userId = localStorage.getItem('user-id');
            if(respData.result.user.id == userId ){
              this.getFirstNews(respData);
            }else{
              var redirectUrl = 'clubwall/';
              this.router.navigate([redirectUrl]);
            }
            
          }
        );
    }
  }

  getFirstNews(allNews) {
    let news = allNews['result'];
    this.newsData = news;
    var type;
    if (this.newsData.audience != null && this.newsData.audience == 2) {
      this.groupVisiblity = "2";
      type = [
        { "id": "2", "name": this.language.create_news.visible_group }
      ];
    }
    else {
      if (this.newsData.audience != null && this.newsData.audience == 0) {
        this.groupVisiblity = "0";
        type = [
          { "id": "0", "name": this.language.create_news.visible_everyone }
        ];
      }
    }

    if (this.newsData.groups.length) {
      let group_selected: any = [];
      for (const key in this.newsData.groups) {
        if (Object.prototype.hasOwnProperty.call(this.newsData.groups, key)) {
          const element = this.newsData.groups[key];
          let item;
          if ("id" in element.group) {
            item = { "id": element.group.id, "name": element.group.name };
            group_selected.push(item);
            this.groupSelectedItem.push(item.id);
          }
        }
      }
      this.updateNewsForm.controls['group_dropdown'].setValue(group_selected);
    }

    this.updateNewsForm.controls['title'].setValue(this.newsData.title);
    this.updateNewsForm.controls['content'].setValue(this.newsData.text);
    this.updateNewsForm.controls['add_image'].setValue(this.newsData.imageUrls);
    this.updateNewsForm.controls['visible_dropdown'].setValue(type);
    this.updateNewsForm.controls['show_guest'].setValue(this.newsData.show_guest_list);
   
  }


}
