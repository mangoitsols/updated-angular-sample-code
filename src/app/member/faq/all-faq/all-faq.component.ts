import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogService } from 'src/app/confirm-dialog/confirm-dialog.service';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { LanguageService } from 'src/app/service/language.service';
import * as Category from '../../../category.json'
import * as FAQ from '../../../FAQ.json'
declare var $: any;

@Component({
    selector: 'app-all-faq',
    templateUrl: './all-faq.component.html',
    styleUrls: ['./all-faq.component.css']
})
export class AllFaqComponent implements OnInit {
    Category: any = (Category as any).default;
    FAQ: any = (FAQ as any).default;
    FAQSubmit = false

    editFAQForm: FormGroup
    language: any;
    imgErrorMsg = false;
    docErrorMsg = false;
    categoryDropdownSettings
    positionDropdownSettings
  
    catListArray:any = [];
    positionList;
    categorySelectedItem: any;
    positionSelectedItem: any;

    constructor(private lang: LanguageService,public formBuilder:FormBuilder,
        private confirmDialogService: ConfirmDialogService,private authService: AuthServiceService) { }

    ngOnInit(): void {
        this.language = this.lang.getLanguaageFile();

        this.editFAQForm = this.formBuilder.group({
            title: ['', [Validators.required]],
            selectedCategory: ['', Validators.required],
            position: ['', Validators.required],
            description: ['', Validators.required],
            add_docImg: ['']
        })

        this.categoryDropdownSettings = {
            singleSelection: false,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: true,
            selectAllText: 'Select All',
            enableCheckAll: false,
            unSelectAllText: 'UnSelect All',
            searchPlaceholderText:this.language.header.search
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
    }
    onCategoryItemSelect(item:any){
        console.log(item);
        console.log(item.id);
    
        this.categorySelectedItem.push(item.id);
        console.log(this.categorySelectedItem);
    }
    onCategoryItemDeSelect(item:any){
        this.categorySelectedItem.push(item.id);
        const index = this.categorySelectedItem.indexOf(item.id);
        if (index > -1) {
            this.categorySelectedItem.splice(index, 1);
        }
    }

    onPositionItemSelect(item:any){
        console.log(item);
        console.log(item.id);
        this.positionSelectedItem.push(item.id);
        console.log(this.positionSelectedItem);
    }
    onPositionItemDeSelect(item:any){
        console.log(item);
        
    }
    editFAQById(id) {
        console.log(id);
        
    }
    deleteFAQ(id) {
        console.log(id);
        console.log(id);
        this.confirmDialogService.confirmThis(this.language.confirmation_message.delete_category, function () {
            // this.authService.memberSendRequest('delete', 'deleteCategory/' + id, null)
            //     .subscribe(
            //         (respData: JSON) => { console.log(respData); })

        }, function () { }
        )
    }
    
    errorFile: any = { isError: false, errorMessage: '' };
    uploadFile(event) {
        console.log(event);
        const file = (event.target as HTMLInputElement).files[0];
        const mimeType = file.type;
        const mimeSize = file.size;

        console.log(mimeSize);
        if ((mimeType.match(/image\/*/) != null) || (mimeType.match(/application\/*/) != null)) {

            if ((mimeType.match(/application\/*/))) {
                if (mimeSize > 20000000) {
                    this.docErrorMsg = true
                    this.errorFile = { isError: true, errorMessage: '' };
                } else {
                    this.errorFile = { isError: false };
                    this.docErrorMsg = false;
                    this.editFAQForm.patchValue({
                        add_docImg: file
                    });
                    this.editFAQForm.get('add_docImg').updateValueAndValidity();
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
                        this.editFAQForm.patchValue({
                            add_docImg: file
                        });
                        this.editFAQForm.get('add_docImg').updateValueAndValidity();

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
    EditFAQ() {
        this.FAQSubmit = true
    }
}
