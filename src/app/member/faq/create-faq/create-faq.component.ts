import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { LanguageService } from 'src/app/service/language.service';
import * as Category from '../../../category.json'
declare var $: any;

@Component({
    selector: 'app-create-faq',
    templateUrl: './create-faq.component.html',
    styleUrls: ['./create-faq.component.css']
})
export class CreateFaqComponent implements OnInit {
    FAQForm: FormGroup;
    FAQSubmit: boolean = false;
    language;
    imgErrorMsg = false;
    docErrorMsg = false;
    image
    responseMessage = null;
    categoryDropdownSettings: any;
    positionDropdownSettings: any;

    catListArray: any = [];
    positionList: any = [];

    categorySelectedItem;
    positionSelectedItem;

    categorySelectedToShow = []

    Category: any = (Category as any).default;
    FaqCategory;
    imgName

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        minHeight: '5rem',
        maxHeight: '15rem',

        translate: 'no',
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
        ],
        sanitize: true,
        toolbarPosition: 'top',
        defaultFontName: 'Arial',
        defaultFontSize: '2',
        defaultParagraphSeparator: 'p'
    };
    constructor(public formBuilder: FormBuilder,private router: Router,
         private lang: LanguageService, private authService: AuthServiceService) { }
    ngOnInit() {

        this.language = this.lang.getLanguaageFile();
        this.getCategory()
        this.positionList = [ {"id": 1, "name": 1},{"id": 2, "name": 2},{"id": 3, "name": 3}, 
        {"id": 4, "name": 4},{"id": 5, "name": 5},{"id": 6, "name": 6},{"id": 7, "name": 7},
        {"id":8, "name": 8},{"id":9, "name": 9},{"id":10, "name": 10}]

        this.categoryDropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: true,
            selectAllText: 'Select All',
            enableCheckAll: false,
            unSelectAllText: 'UnSelect All',
            searchPlaceholderText: this.language.header.search
        }
        this.positionDropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: false,
            selectAllText: false,
            enableCheckAll: false,
            unSelectAllText: false,
            // searchPlaceholderText:this.language.header.search
        }
        this.FAQForm = this.formBuilder.group({
            title: ['', [Validators.required]],
            category: ['', Validators.required],
            position: ['', Validators.required],
            description: ['', Validators.required],
            image: ['']
        })

    }
    getCategory() {
        // console.log(this.catListArray = Category.category_List);
        // console.log(this.catListArray);
        // Object(Category.category_List).forEach((val,key) => {
        //     this.catListArray.push({
        //         'id': val.id,
        //         'name': val.name,
        //       });

        //   })
        //   console.log(this.catListArray);

        this.authService.setLoader(true);
		this.authService.memberSendRequest('get', 'category', null).subscribe(
			(respData) => {
				this.authService.setLoader(false)
				console.log(respData);
				// this.categoryData = respData
				// console.log(this.categoryData);

                let self = this;
                Object(respData).forEach((key,value) => {
                    // console.log(key, value);
                    self.catListArray.push({ 'id': key.id, 'name': key.category_title });
                    // console.log(key.category_title);
                    // self.positionList.push({ 'id': key.id, 'name': key.category_position });
                })
                console.log(this.catListArray);
                //console.log(this.positionList);
			}
		)
        // let self = this;
        // this.authService.memberSendRequest('get', 'category', null)
        //     .subscribe(
        //         (respData) => {
        //             this.authService.setLoader(false);
        //             //   this.FaqCategory = respData;
        //               console.log(respData); 
        //             Object(respData).forEach((key,value) => {
        //                 console.log(key, value);
                        
        //                 self.catListArray.push({ 'id': key.id, 'name': key.category_title });
        //                 // console.log(key.category_title);
        //                 self.positionList.push({ 'id': key.id, 'name': key.category_position });
        //             })
        //             self.categoryDropdownSettings = {
        //                 singleSelection: true,
        //                 idField: 'id',
        //                 textField: 'name',
        //                 allowSearchFilter: true,
        //                 selectAllText: 'Select All',
        //                 enableCheckAll: false,
        //                 unSelectAllText: 'UnSelect All',
        //                 searchPlaceholderText: this.language.header.search
        //             }
        //             self.positionDropdownSettings = {
        //                 singleSelection: true,
        //                 idField: 'id',
        //                 textField: 'name',
        //                 allowSearchFilter: false,
        //                 selectAllText: false,
        //                 enableCheckAll: false,
        //                 unSelectAllText: false,
        //                 // searchPlaceholderText:this.language.header.search
        //             }
        //             console.log(this.catListArray);
        //             console.log(this.positionList);

        //         },
        //         (error) => {
        //             this.authService.setLoader(false)
        //             console.log(error);
        //         }
        //     )

    }
    onCategoryItemSelect(item: any) {
        console.log(item);
        console.log(item.id);
        console.log(item.name);

        this.categorySelectedItem = item.id;
        console.log(this.categorySelectedItem);
    }
    onCategoryItemDeSelect(item: any) {
        this.categorySelectedItem = item.id;
        // const index = this.categorySelectedItem.indexOf(item.id);
        // if (index > -1) {
        //     this.categorySelectedItem.splice(index, 1);
        // }
    }

    onPositionItemSelect(item: any) {
        console.log(item);
        console.log(item.id);
        this.positionSelectedItem = item.id;
        console.log(this.positionSelectedItem);
    }
    onPositionItemDeSelect(item: any) {
        console.log(item);

    }
    errorFile: any = { isError: false, errorMessage: '' };
    uploadFile(event) {
        console.log(event);
        var file:any = (event.target as HTMLInputElement).files[0];
        console.log(file);
        console.log(file.name);
        
        const mimeType = file.type;
        const mimeSize = file.size;
        this.imgName = file.name

        console.log(mimeSize);
        if ((mimeType.match(/image\/*/) != null) || (mimeType.match(/application\/*/) != null)) {

            if ((mimeType.match(/application\/*/))) {
                if (mimeSize > 20000000) {
                    this.docErrorMsg = true
                    this.errorFile = { isError: true, errorMessage: '' };
                } else {
                    this.errorFile = { isError: false };
                    this.docErrorMsg = false;
                    this.FAQForm.patchValue({
                        image: file
                    });
                    this.FAQForm.get('image').updateValueAndValidity();
                    this.image =  file;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    var url;
                    let self = this
                    reader.onload = (_event) => {
                        url = reader.result;
                        console.log('-------File url---------');
                        console.log(url);
                        $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
                    }
                    $('.preview_txt').show();
                    $('.preview_txt').text(file.name);
                }
            }
            if ((mimeType.match(/image\/*/))) {

                var imagee = new Image();
                imagee.src = URL.createObjectURL(file);
                imagee.onload = (e: any) => {
                    const imagee = e.path[0] as HTMLImageElement;
                    console.log(imagee.height);
                    console.log(imagee.width);
                    var imgHeight = imagee.height
                    var imgWidth = imagee.width
                    if ((imgHeight >= 1000 && imgHeight <= 1100) && (imgWidth >= 1000 && imgWidth <= 1100)) {
                        this.errorFile = { isError: false };
                        this.imgErrorMsg = false;
                        this.FAQForm.patchValue({
                            image: file  
                        });
                        this.FAQForm.get('image').updateValueAndValidity();
                        this.image =  file;
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        var url;
                        let self = this
                        reader.onload = (_event) => {
                            url = reader.result;
                            console.log('-------image url---------');
                            console.log(url);
                            $('.preview_img').attr('src', url);
                        }
                        $('.preview_txt').show();
                        $('.preview_txt').text(file.name);
                    } else {
                        this.imgErrorMsg = true;
                        this.errorFile = { isError: true, errorMessage: '' };
                    }
                }
            }
        }
    }

    createFAQ() {
        this.FAQSubmit = true
        this.FAQForm.controls["category"].setValue(this.categorySelectedItem);
        this.FAQForm.controls["position"].setValue(this.positionSelectedItem);
        this.FAQForm.controls["image"].setValue(this.imgName );

        console.log(this.FAQForm);
        console.log(this.FAQForm.value);
        this.authService.memberSendRequest('post', 'createFaq', this.FAQForm.value)
        		.subscribe(
        			(respData) => {
        				console.log(respData)
                        if(respData['isError'] == false){
                            this.responseMessage = respData['result']['message'];
                                // window.location.reload();
                                setTimeout(() => {
                                    this.router.navigate(['vereins-faq']);
                                }, 200);
                        }
                        if (respData['code'] == 400) {
                            this.responseMessage = respData['message'];
                            // if (respData['result']['message'] == "Already exist") {
                            //   this.responseMessage = this.language.response_message.news_already_exist;
                            // }
                          }
        			},
        			(error) => {
        				console.log(error);
        			}
        		);
    }
}  
