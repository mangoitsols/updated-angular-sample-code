import { Component, OnInit } from '@angular/core';
import * as FAQ from '../../../FAQ.json'
import * as Category from '../../../category.json';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { LanguageService } from '../../../service/language.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;

@Component({
	selector: 'app-vereins-faq',
	templateUrl: './vereins-faq.component.html',
	styleUrls: ['./vereins-faq.component.css']
})
export class VereinsFaqComponent implements OnInit {
	displayChats: boolean;

	FAQ: any = (FAQ as any).default;
	Category: any = (Category as any).default

    responseMessage = null;
	language: any;
    FAQForm: FormGroup;
    searchForm:FormGroup
    FAQSubmit: boolean = false;
    imgErrorMsg = false;
    docErrorMsg = false;
    image
	categoryData: any = [];

    categoryDropdownSettings: any;
    positionDropdownSettings: any;
    catListArray: any = [];
    positionList: any = [];

    categorySelectedItem;
    positionSelectedItem;
    positionDeSelectedItem;
    categoryDeSelectedItem;


	faqDataById
    faqDataByCat 
    count = 0;
    FaqCategory;
    editId: any;
    FaqById;
    userDetails: any;
    userRole
    positionn:any = []
    categoryShow:any = []
    documentFile: any;
    faqId: any;
    allFaq:any = "";
    searchData:any;
    noSearchData: number = 0;

	
	constructor(private authService: AuthServiceService, public formBuilder: FormBuilder, private router:Router,
		private lang: LanguageService,private confirmDialogService: ConfirmDialogService) { }

	ngOnInit() {
		// this.getFaqById(5)
        $('#individualFAQ').show();
        $('#AllFAQ').hide();
        $('#searchId').hide();

		this.language = this.lang.getLanguaageFile();
        this.userDetails = JSON.parse(localStorage.getItem('user-data'));
        this.userRole = this.userDetails.roles[0];
        console.log(this.userRole);
        
		this.getCategoryName()
        this.positionList = [  {"id": 1, "name": 1},{"id": 2, "name": 2},{"id": 3, "name": 3}, 
		{"id": 4, "name": 4},{"id": 5, "name": 5},{"id": 6, "name": 6},{"id": 7, "name": 7},
		{"id":8, "name": 8},{"id":9, "name": 9},{"id":10, "name": 10} ];
        
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
		}
		this.FAQForm = this.formBuilder.group({
			title: ['', [Validators.required]],
			category: ['', Validators.required],
			position: ['', Validators.required],
			description: ['', Validators.required],
			image: ['']
		})
        this.searchForm = new FormGroup({
                'search': new FormControl('',)
        })
	}
	onCategoryItemSelect(item: any) {
        console.log(item);
        this.categorySelectedItem = item.id;
    }
    onCategoryItemDeSelect(item: any) {
        this.categoryDeSelectedItem = item.id;
    }

    onPositionItemSelect(item: any) {
        this.positionSelectedItem = item.id;
    }
    onPositionItemDeSelect(item: any) {
        console.log(item);
        // this.positionSelectedItem = item.id;
        // this.FAQForm.controls["position"].setValue("");

	}

    errorFile: any = { isError: false, errorMessage: '' };
    uploadFile(event) {
        console.log(event);
        var file:any = (event.target as HTMLInputElement).files[0];
        console.log(file);
        console.log(file.name);
        
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
                    this.FAQForm.patchValue({
                        image: file
                    });
                    this.image =  file;
                    this.FAQForm.get('image').updateValueAndValidity();
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
	getCategoryName() {
		this.authService.setLoader(true);
		this.authService.memberSendRequest('get', 'category', null).subscribe(
			(respData) => {
				this.authService.setLoader(false)
				this.categoryData = respData
                let self = this;
                Object(respData).forEach((key,value) => {
                    if(value == 0){
                        self.getFaqByCategory(key.id);
                    }
                    self.catListArray.push({ 'id': key.id, 'name': key.category_title });
                })
			}
		)
	}
	getFaqByCategory(id:any){
		console.log(id);
        this.faqId = id
		this.authService.memberSendRequest('get', 'getFaqbyCategory/'+ id ,null).subscribe(
			(respData) => {
				this.authService.setLoader(false)
                console.log(respData);
                let data:any = respData

                    if(data.length > 0){
                        this.faqDataByCat = respData;
                        this.count = this.count + 1;
                    }else{
                        this.count = 0;
                    }
                // this.faqDataByCat.forEach(element => {
                //     this.documentFile = element.image;
                // });
			}
		)
	}
	editFAQById(id) { 
		console.log(id);
		this.authService.setLoader(true);
		this.authService.memberSendRequest('get','getFaqbyId/'+ id,null).subscribe(
		  (respData:any) => {
		    this.authService.setLoader(false)
            this.editId = respData[0].id;
            let self = this;
            respData.forEach(function(val,key){
                self.faqDataById = val;
            })
            self.setEditFaqData();
		 }
		)  
	}
    setEditFaqData(){
        console.log(this.faqDataById.position);
        console.log(this.faqDataById.category);

        if(this.faqDataById.position){
            let self = this
            this.positionList.forEach((val, key) => { 
                if(val.id == self.faqDataById.position){
                    self.positionn = [];
                    self.positionn.push({id:val.id , name: val.name})
                    self.FAQForm.controls["position"].setValue(self.positionn);        
                }
            })
        }
        this.catListArray.forEach((val, key) => { 
            if(val.id == this.faqDataById.category){
                this.categoryShow = []
                this.categoryShow.push({id:val.id , name: val.name})
                this.FAQForm.controls["category"].setValue(this.categoryShow);        
            }
        })
        this.FAQForm.controls["title"].setValue(this.faqDataById.title);
        this.FAQForm.controls["description"].setValue(this.faqDataById.description);
        this.FAQForm.controls["image"].setValue(this.faqDataById.image);  
        $('#exModal').modal('show');
        $("#editFaq").click();  
    }
	editFAQ(){
        console.log('-----editFAQ--------');
        
        if(this.positionSelectedItem){
            this.FAQForm.controls["position"].setValue(this.positionSelectedItem)
        }else if(this.faqDataById.position){
                this.positionn.forEach((val,key) =>{
                console.log(val,key);
                this.positionn = val.name
                console.log(this.positionn);
                this.FAQForm.controls["position"].setValue(this.positionn);        
            })
        }
        if(this.categorySelectedItem){
            this.FAQForm.controls["category"].setValue(this.categorySelectedItem)
        }else if(this.faqDataById.category){
            this.categoryShow.forEach((val,key) =>{
                this.categoryShow = val.id
                this.FAQForm.controls["category"].setValue(this.categoryShow);        
            })
        }
		console.log(this.FAQForm.value);	

        this.authService.setLoader(true);
            console.log(this.editId);
            this.authService.memberSendRequest('put','updateFaq/'+this.editId,this.FAQForm.value).subscribe(
            (respData) => {
                this.authService.setLoader(false);
                console.log(respData);   
                if(respData['isError'] == false){
                    this.responseMessage = respData['result']['message'];
                    // this.showAllFAQs()
                    this.getFaqByCategory(this.faqId)
                    
                        setTimeout(() => {
                            $('responseMessage').hide();
                            $('#exModal').modal('hide');
                        },1000);
                
                    this.responseMessage = "";
                }else if (respData['code'] == 400) {
                    this.responseMessage = respData['message'];
                    // if (respData['result']['message'] == "Already exist") {
                    //   this.responseMessage = this.language.response_message.news_already_exist;
                    // }
                  }
            },
            (error) => {
                this.authService.setLoader(false);
                console.log(error);
            }
        )
	}
	deleteFAQ(id) { 
		let self = this;
        console.log(id); 
        self.confirmDialogService.confirmThis(self.language.confirmation_message.delete_category, function () {  

            self.authService.setLoader(true);
            self.authService.memberSendRequest('delete', 'deleteFaq/' + id, null)
                .subscribe(
                (respData) => 
                    { 
                        self.authService.setLoader(false);

                        if(respData['isError'] == false){
                            $('#responseMessage').show();
                            self.responseMessage = respData['result']['message'];  
                            // this.showAllFAQs()
                            self.getFaqByCategory(self.faqId)    
                            setTimeout(function(){
                                $('#responseMessage').delay(1000).fadeOut();
                            },1000);
                    
                        }else if (respData['code'] == 400) {
                            self.responseMessage = respData['message'];
                        }
                    }
                )
        }, function () { }
        )
	}
    onSearch(){
        this.searchData = null;
        this.noSearchData = 0
        console.log(this.searchForm);
        console.log(this.searchForm.value.search);
        let searchValue = this.searchForm.value.search
        
        this.authService.setLoader(true);
        // /api/getFaqbytitle/:title
		this.authService.memberSendRequest('get', 'getFaqbytitle/'+ searchValue,null).subscribe(
			(respData) => {
				this.authService.setLoader(false)
                if(respData){
                    $('#individualFAQ').hide();
                    $('#AllFAQ').hide();
                    $('#searchId').show();
                    this.searchData = respData
                    console.log(respData);
                }
                if(respData == null){
                    this.noSearchData = 1;
                }
                    if (respData['success'] == false) {
                    this.responseMessage = respData['message'];
                        setTimeout(function(){
                            $('#responseMessage').delay(1000).fadeOut();
                        },1000);
                  }
			}
		)
    }
    showAllFAQs(){
        console.log('----all faqs------');
        this.authService.setLoader(true);
        this.authService.memberSendRequest('get', 'faq/',null).subscribe(
			(respData) => {
				console.log(respData);
                    $('#individualFAQ').hide();
                    $('#searchId').hide();

                $('#AllFAQ').show();
				this.authService.setLoader(false)
                if(respData){
                    this.allFaq = respData
                }

			}
		)
        
    }
    editAFAQ(){
        let self = this;
        console.log('--------editAFAQ----------');
        
        // $('#AllFAQ').hide();
        if(self.positionSelectedItem){
            self.FAQForm.controls["position"].setValue(self.positionSelectedItem)
        }else if(self.faqDataById.position){
                self.positionn.forEach((val,key) =>{
                console.log(val,key);
                self.positionn = val.name
                console.log(self.positionn);
                self.FAQForm.controls["position"].setValue(self.positionn);        
            })
        }
        if(self.categorySelectedItem){
            self.FAQForm.controls["category"].setValue(self.categorySelectedItem)
        }else if(self.faqDataById.category){
            self.categoryShow.forEach((val,key) =>{
                self.categoryShow = val.id
                self.FAQForm.controls["category"].setValue(self.categoryShow);        
            })
        }
		console.log(self.FAQForm.value);	
        self.authService.setLoader(true);
            console.log(self.editId);
            self.authService.memberSendRequest('put','updateFaq/'+self.editId,self.FAQForm.value).subscribe(
            (respData) => {
                self.authService.setLoader(false);
                console.log(respData);  

                if(respData['isError'] == false){
                    self.responseMessage = respData['result']['message'];
                    // self.router.navigate([self.router.url])
                            self.showAllFAQs()
                            setTimeout(function(){
                                $('#responseMessage').delay(1000).fadeOut();
                                $('#exModal1').modal('hide');
                            },1000);
                    
                            // this.router.navigateByUrl('/vereins-faq', { skipLocationChange: true }).then(() => {
                            //     this.router.navigate([' VereinsFaqComponent']);
                            // });
            
                    self.responseMessage = "";
                }else if (respData['code'] == 400) {
                    self.responseMessage = respData['message'];
                    // if (respData['result']['message'] == "Already exist") {
                    //   self.responseMessage = self.language.response_message.news_already_exist;
                    // }
                  }
            },
            (error) => {
                self.authService.setLoader(false);
                console.log(error);
            }
        )
	}
	deleteAFAQ(id) { 
		let self = this;
        console.log('--------deleteAFAQ-------------');
        
        self.confirmDialogService.confirmThis(self.language.confirmation_message.delete_category, function () {  

            self.authService.setLoader(true);
            self.authService.memberSendRequest('delete', 'deleteFaq/' + id, null)
                .subscribe(
                (respData) => 
                    { 
                        self.authService.setLoader(false);

                        if(respData['isError'] == false){
                            $('#responseMessage').show();
                            self.responseMessage = respData['result']['message'];  
                            self.showAllFAQs()

                            setTimeout(function(){
                                $('#responseMessage').delay(1000).fadeOut();
                            },1000);
                    
                        }else if (respData['code'] == 400) {
                            self.responseMessage = respData['message'];
                        }
                    }
                )

        }, function () { }
        )
	}
    backToVerein(){
        $('#individualFAQ').show();
        $('#searchId-two').hide();
        $('#AllFAQ').hide();
    }
    backToFaq(){
            $('#individualFAQ').show();
            $('#searchId').hide();
            $('#AllFAQ').show();
    }

}
