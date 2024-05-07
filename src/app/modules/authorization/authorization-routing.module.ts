import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginComponent} from '@modules/authorization/pages/login/login.component';
import {NoauthGuard} from '@core/guards';
import {RecoverPasswordComponent} from '@modules/authorization/pages/recover-password/recover-password.component';
import {MEmailComponent} from '@modules/mobile-app/shared/m-email/m-email.component';


const routes: Routes = [
  {path: 'login', component: LoginComponent, canActivate: [NoauthGuard], data: {title: 'Login'}},
  {path: 'recover-password', component: RecoverPasswordComponent, canActivate: [NoauthGuard], data: {title: 'Recover Password'}},
  {path: 'email', component: MEmailComponent, data: {title: 'Email'}},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorizationRoutingModule {
}
