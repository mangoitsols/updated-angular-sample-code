import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthServiceService } from '../../service/auth-service.service';
import { appSetting } from '../../app-settings';
import { LanguageService } from '../../service/language.service';
import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
	selector: 'app-organizer',
	templateUrl: './organizer.component.html',
	styleUrls: ['./organizer.component.css']
})
export class OrganizerComponent implements OnInit {
	language;
	documentForm: FormGroup;
	enableFile;
	responseMessage = null;
	displayEvents: boolean = false;
	displayTasks: boolean = false;
	displayDocs: boolean = false;
	userDetails;
	userAccess;
	extensions;
	createAccess;
	participateAccess;
	authorizationAccess;

	constructor(
		private lang: LanguageService,
		private authService: AuthServiceService,
		public formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
	) {
		var url = this.router.url.split("/")['2'];
		if(url == 'organizer-task'){
			this.displayTasks = true;
		}else if( url == 'organizer-documents'){
			this.displayDocs = true;
		}else{
			this.displayEvents = true;
		}
	 }

	ngOnInit(): void {
		this.language = this.lang.getLanguaageFile();
		this.userDetails = JSON.parse(localStorage.getItem('user-data'));
		let userRole = this.userDetails.roles[0];
	
		this.userAccess = appSetting.role;
		this.extensions = appSetting.extensions;
		this.createAccess = this.userAccess[userRole].create;
		this.participateAccess = this.userAccess[userRole].participate;
		this.authorizationAccess = this.userAccess[userRole].authorization;
		if (localStorage.getItem("trigger-doc") !== null) {
			setTimeout(function () {
				let triggered = localStorage.getItem("trigger-doc");
				$('#organizer_doc').trigger('click');
				localStorage.removeItem("trigger-doc");
			}, 3000);
		}
	}

	onEvents() {
		this.displayEvents = true;
		this.displayTasks = false;
		this.displayDocs = false;
	}

	onTasks() {
		this.displayTasks = true;
		this.displayEvents = false;
		this.displayDocs = false;
	}

	onDocuments() {
		this.displayTasks = false;
		this.displayEvents = false;
		this.displayDocs = true;
	}
	showMenu: boolean = false;
	onOpen() {
		let el = document.getElementsByClassName("all_btn_group btn_collapse");
		if (!this.showMenu) {
			this.showMenu = true;
			el[0].className = "all_btn_group btn_collapse open";
		}
		else {
			this.showMenu = false;
			el[0].className = "all_btn_group btn_collapse";
		}
	}

	uploadFile(event) {
		this.documentForm = new FormGroup({
			'add_image': new FormControl('', Validators.required),
			'category': new FormControl('', Validators.required),
			'club_id': new FormControl('1', Validators.required)
		});
		const file = (event.target as HTMLInputElement).files[0];
		const mimeType = file.type;
		let category_text = '';
		for (let index = 0; index < $('.nav-tabs').children().length; index++) {
			const element = $('.nav-tabs').children().children();
			if (element[index].classList.length >= 2) {
				category_text = element[index].text;
			}
		}

		if (category_text != '') {
			var category;
			if (category_text == this.language.club_document.my_documents) {
				category = 'personal';
			}
			if (category_text == this.language.club_document.club_documents) {
				category = 'club';
			}
			if (category_text == this.language.club_document.archived_documents) {
				category = 'archive';
			}
			if (category_text == this.language.club_document.current_status) {
				category = 'current-statuses';
			}

			this.documentForm.patchValue({
				add_image: file,
				category: category
			});
		
			this.documentForm.get('category').updateValueAndValidity();

			const reader = new FileReader();
			var imagePath = file;
			reader.readAsDataURL(file);
			var url;
			reader.onload = (_event) => {
				url = reader.result;
			}
			var ext = file.name.split(".");
			let fileError = 0;
			for (const key in this.extensions) {
				if (Object.prototype.hasOwnProperty.call(this.extensions, key)) {
					const element = this.extensions[key];
					if (key == ext[(ext.length) - 1]) {
						fileError++;
					}
				}
			}
			if (fileError != 0) {
				this.insertDoc();
				this.responseMessage = null;
				setTimeout(() => {
					window.location.reload();
					localStorage.setItem("trigger-doc", "doc");
					$('#organizer_doc').trigger('click');
				}, 3000);
			}
			else {
				this.responseMessage = this.language.error_message.common_valid;
			}
		}
	}

	insertDoc() {
		var formData: any = new FormData();
		this.authService.setLoader(true);
		for (const key in this.documentForm.value) {
			if (Object.prototype.hasOwnProperty.call(this.documentForm.value, key)) {
				const element = this.documentForm.value[key];
				if (key == 'add_image') {
					formData.append('file', element);
				}
				else {
					if (key != 'add_image') {
						formData.append(key, element);
					}
				}
			}
		}
		this.authService.memberSendRequest('post', 'documents/insert', formData)
			.subscribe(
				(respData) => {
					this.authService.setLoader(false);
					if (respData == "Uploaded") {
						this.responseMessage = respData;
						setTimeout(() => {
							window.location.reload();
						}, 3000);
					}
					if (respData['code'] == 400) {
						this.responseMessage = respData['message'];
					}
				}
			);
	}
}
