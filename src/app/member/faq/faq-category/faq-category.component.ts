import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../../../service/language.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
declare var $: any;

@Component({
    selector: 'app-faq-category',
    templateUrl: './faq-category.component.html',
    styleUrls: ['./faq-category.component.css'],
    providers: [DatePipe]
})
export class FaqCategoryComponent implements OnInit {
    language;
    submitted = false;
    editFormSubmit = false;
    editFaqForm: FormGroup;
    responseMessage = null;
    responseMessage1 = null;

    visiblityDropdownSettings;
    groupDropdownSettings;
    positionDropdownSettings
    dropdownSettings;

    groupSelectedItem = [];
    positionSelectedItem;
    PositionItemDeSelect;

    positionList= [];
    visiblity = [];
    groupVisiblity;
    groups;
    FaqCategory;
    FaqCat:any ;
    dropdownList;
    currentUrl;
    position:any = [];
    editId;
    getParamFromUrl;
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
        
    
    constructor(
        private authService: AuthServiceService,
        private router: Router,
        public formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private lang: LanguageService,
        private confirmDialogService: ConfirmDialogService,
    ) { 
        this.getParamFromUrl = this.router.url;
    }

    ngOnInit(): void {
        this.language = this.lang.getLanguaageFile();
        this.getAllFAQCategory();        
        this.positionList = [ 
        {"id": 1, "name": 1},{"id": 2, "name": 2},{"id": 3, "name": 3}, 
		{"id": 4, "name": 4},{"id": 5, "name": 5},{"id": 6, "name": 6},{"id": 7, "name": 7},
		{"id":8, "name": 8},{"id":9, "name": 9},{"id":10, "name": 10} ]
        
        this.editFaqForm = this.formBuilder.group({
        	category_title: ['', [Validators.required]],
			// category_description: ['', Validators.required],
			category_position: ['']
        });

        this.positionDropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: false,
            selectAllText: false,
            enableCheckAll: false,
            unSelectAllText: false
        }

    }
    onPositionItemSelect(item:any){
        this.positionSelectedItem = item.id;
    }

    onPositionItemDeSelect(item:any){
        this.PositionItemDeSelect = item.id
        this.editFaqForm.controls["category_position"].setValue("");
    }

    getAllFAQCategory() {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('get','category',null)
        .subscribe(
            (respData) => {
                this.authService.setLoader(false);
                this.FaqCategory =  respData
            },
            (error) =>{
                this.authService.setLoader(false);
            }
        )
    }

    editFAQcategoryById(id){
        this.authService.setLoader(true);
        this.authService.memberSendRequest('get','categoriesById/'+id,null).subscribe(
            (respData:any) => {
                this.authService.setLoader(false);
                this.editId = respData[0].id;
                let self = this;
                respData.forEach(function (val, key) {
                    self.FaqCat = val; 
                    self.position = [];
                    self.setEditFAQCategory();
                });
                // $('#exModal').modal('show');
            },
            (error) => {
                this.authService.setLoader(false);
                console.log(error);
            }
        )
    }

    setEditFAQCategory(){
        if(this.FaqCat.category_position){
            this.positionList.forEach((val, key) => {
                if(val.id == this.FaqCat.category_position){
                    this.position.push({id:val.id , name: val.name})
                    this.editFaqForm.controls["category_position"].setValue(this.position);
                }
            })
            this.editFaqForm.controls["category_title"].setValue(this.FaqCat.category_title);
            // this.editFaqForm.controls["category_description"].setValue(this.FaqCat.category_description);

        }else if(this.FaqCat.category_position == null){
            this.editFaqForm.controls["category_position"].setValue("");
            this.editFaqForm.controls["category_title"].setValue(this.FaqCat.category_title);
            // this.editFaqForm.controls["category_description"].setValue(this.FaqCat.category_description);
        }
        $('#exModal').modal('show');
        $("#editCat").click();
    }

    editFAQCategory(){
        this.editFormSubmit = true;
        if(this.positionSelectedItem){
            this.editFaqForm.controls["category_position"].setValue(this.positionSelectedItem)
        }
        else if(this.PositionItemDeSelect){
            this.editFaqForm.controls["category_position"].setValue("");
        }
        else if(this.FaqCat.category_position){
            this.position.forEach((val,key) =>{
                this.position = val.name
            })
            this.editFaqForm.controls["category_position"].setValue(this.position);
        }else if(this.FaqCat.category_position == null){
            this.editFaqForm.controls["category_position"].setValue("");
        }

        this.authService.setLoader(true);
            console.log(this.editId);
            this.authService.memberSendRequest('put','category/'+this.editId,this.editFaqForm.value).subscribe(
            (respData) => {
                this.authService.setLoader(false);
                this.FaqCat = respData;
                if(respData['isError'] == false){
                    this.responseMessage1 = respData['result']['message'];
                    this.getAllFAQCategory();

                    setTimeout(function(){
                        $('#responseMessage1').hide();
                        $('#exModal').modal('hide');
                    }, 2000);

                }else if (respData['code'] == 400) {
                    this.responseMessage1 = respData['result']['message'];
                }
            },
            (error) => {
                this.authService.setLoader(false);
            }
        )

    }

    deleteCategory(id) {
        let self = this;
        self.confirmDialogService.confirmThis(self.language.confirmation_message.delete_category, function () {
            self.authService.setLoader(true);
            self.authService.memberSendRequest('delete', 'category/' + id, null)
            .subscribe(
                (respData) => 
                { 
                    self.authService.setLoader(false);
                    if(respData['isError'] == false){
                        $('#responseMessage').show();
                        self.responseMessage = respData['result']['message'];

                        self.getAllFAQCategory();                       
                        setTimeout(function(){
                            $('#responseMessage').delay(1000).fadeOut();
                        }, 2000);
                    }else if (respData['code'] == 400) {
                        self.responseMessage = respData['message'];
                    }
                }
            )
        }, function () { }
        )
    }

    // reLoad(){
    //     this.router.navigate([this.router.url])
    // }
}
