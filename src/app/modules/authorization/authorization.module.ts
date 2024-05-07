import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from '@modules/authorization/pages/login/login.component';
import {RecoverPasswordComponent} from '@modules/authorization/pages/recover-password/recover-password.component';
import {SharedModule} from '@shared/shared.module';
import {AuthorizationRoutingModule} from '@modules/authorization/authorization-routing.module';


@NgModule({
  declarations: [
    LoginComponent,
    RecoverPasswordComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AuthorizationRoutingModule,
  ]
})

export class AuthorizationModule {
}
