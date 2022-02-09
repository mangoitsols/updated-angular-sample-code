import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { AuthServiceService } from '../../service/auth-service.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor( public authService: AuthServiceService, private cdref: ChangeDetectorRef,private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
    if(!localStorage.getItem('token') || localStorage.getItem('token') == null){
      window.location.reload();
    }
  }

}
