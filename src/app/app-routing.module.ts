import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@modules/web-app/shared/page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';


const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },

    { path: '', loadChildren: () => import('src/app/modules/authorization/authorization.module').then(m => m.AuthorizationModule) },

    { path: 'web', loadChildren: () => import('src/app/modules/web-app/web-app.module').then(m => m.WebAppModule) },

    { path: 'mobile', loadChildren: () => import('src/app/modules/mobile-app/mobile-app.module').then(m => m.MobileAppModule) },

    { path: '**', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } },
];

@NgModule({
    // imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
