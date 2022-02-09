import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../service/auth-service.service';
import { LanguageService } from '../../../service/language.service';
@Component({
	selector: 'app-create-category',
	templateUrl: './create-category.component.html',
	styleUrls: ['./create-category.component.css']
})
export class CreateCategoryComponent implements OnInit {
	categoryForm: FormGroup;
	formSubmit: boolean = false;
	language: any;
	positionSelectedItem  = 0;
	positionDropdownSettings;
	positionList = [];
	responseMessage

	constructor(public formBuilder: FormBuilder,  private router: Router, private authService: AuthServiceService,private lang: LanguageService) { 
	}

	ngOnInit() {
		this.language = this.lang.getLanguaageFile();
        this.positionList = [{"id": 1, "name": 1},{"id": 2, "name": 2},{"id": 3, "name": 3}, {"id": 4, "name": 4},{"id": 5, "name": 5},{"id": 6, "name": 6},
		{"id": 7, "name": 7},{"id":8, "name": 8},{"id":9, "name": 9},{"id":10, "name": 10} ]
		this.categoryForm = this.formBuilder.group({
			category_title: ['', [Validators.required]],
			// category_description: ['', Validators.required],
			category_position: ['']
		})
		this.positionDropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            allowSearchFilter: false,
            selectAllText: false,
            enableCheckAll: false,
            unSelectAllText: false,
			closeDropDownOnSelection: true
        }
	}

	onPositionItemSelect(item:any){
		if(item.id){
			this.positionSelectedItem = item.id;
		}		
    }

    onPositionItemDeSelect(item:any){
        console.log(item);
    }

	createCategory() {
		this.formSubmit = true;
		if(this.formSubmit && this.categoryForm.valid){

			if(this.positionSelectedItem == 0){
				this.categoryForm.controls["category_position"].setValue("")
			}else{
				this.categoryForm.controls["category_position"].setValue(this.positionSelectedItem)
			}
			this.authService.setLoader(true);
			this.authService.memberSendRequest('post', 'createCategory', this.categoryForm.value)
			.subscribe(
				(respData) => {
					this.authService.setLoader(false);
					if(respData['isError'] == false){
						this.responseMessage = respData['result']['message'];
						setTimeout(() => {
							this.router.navigate(['faq-category']);								
						}, 2000);
					}else if (respData['code'] == 400) {
						this.responseMessage = respData['message'];
					}
				},(error) => {
					this.authService.setLoader(false);
				}
			);
		}
	}

}
