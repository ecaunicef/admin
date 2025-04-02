import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { canActivate, canMatch, fetchUserData, checkGuestUser } from './middleware/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PageNotFoundServerErrorComponent } from './page-not-found-server-error/page-not-found-server-error.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        canActivate: [checkGuestUser],
        children: [
            { path: "", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) }
        ]
    },
    // { path: 'password-reset', component: ResetPasswordComponent },
    { path:'password-reset/:id/:token',component:ResetPasswordComponent},
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [fetchUserData],
        children: [
            {//
                path: "area-list",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Area' }
                },
                loadChildren: () => import('./gis/area/area.module').then(m => m.AreaModule)
            },
            {//
                path: "users",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Admin'}
                },
                loadChildren: () => import('./access-control/users/users.module').then(m => m.UsersModule)
            },
              {//
                path: "credential",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Credential'}
                },
                loadChildren: () => import('./access-control/credential/credential.module').then(m => m.CredentialModule)
            },
            {
                path: "audit-trail",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Admin'}
                },
                loadChildren: () => import('./audit-trail/audit-trail.module').then(m => m.AuditTrailModule)
            },
            //data exchange end
            { //
                path: "summary",
                canActivateChild: [canActivate],
                data: {
                  module: {module:'Home',subModule:'Dashboard'}
                },
                loadChildren: () => import('./summary/summary.module').then(m => m.SummaryModule)
            },
            { //
                path: "landing",
                canActivateChild: [canActivate],
                data: {
                  module: {module:'Home',subModule:'Dashboard'}
                },
                loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomeModule)
            },  
            {//
                path: "classification",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Admin'}
                },
                loadChildren: () => import('./classification/classification.module').then(m => m.ClassificationModule)
            },
                  {//
                    path: "category",
                    canActivateChild: [canActivate],
                    data: {
                        module: { module: 'Admin'}
                    },
                    loadChildren: () => import('./category/category.module').then(m => m.CategoryModule)
                },
                  {//
                    path: "feedback",
                    canActivateChild: [canActivate],
                    data: {
                        module: { module: 'Admin'}
                    },
                    loadChildren: () => import('./feedback/feedback.module').then(m => m.FeedbackModule)
                },
                    {//
                        path: "counselling",
                        canActivateChild: [canActivate],
                        data: {
                            module: { module: 'Admin'}
                        },
                        loadChildren: () => import('./counselling/counselling.module').then(m => m.CounsellingModule)
                    },
                    {//
                        path: "mood-trackers",
                        canActivateChild: [canActivate],
                        data: {
                            module: { module: 'Admin'}
                        },
                        loadChildren: () => import('./mood-trackers/mood-trackers.module').then(m => m.MoodTrackersModule)
                    },
                        {//
                            path: "customize",
                            canActivateChild: [canActivate],
                            data: {
                                module: { module: 'Admin'}
                            },
                            loadChildren: () => import('./customize/customize.module').then(m => m.CustomizeModule)
                        },
                              {//
                                path: "language",
                                canActivateChild: [canActivate],
                                data: {
                                    module: { module: 'Admin'}
                                },
                                loadChildren: () => import('./language/language.module').then(m => m.LanguageModule)
                            },
                    {//
                        path: "blog",
                        canActivateChild: [canActivate],
                        data: {
                            module: { module: 'Admin'}
                        },
                        loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule)
                    },
                
            
            
            {
                path: "import-logs",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Admin' }
                },
                loadChildren: () => import('./import-logs/import-logs.module').then(m => m.ImportLogsModule)
            },
            {
                path: "helpline",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Admin' }
                },
                loadChildren: () => import('./helpline/helpline.module').then(m => m.HelplineModule)
            },
            {
                path: "mood-mapper",
                canActivateChild: [canActivate],
                data: {
                    module: { module: 'Admin' }
                },
                loadChildren: () =>import('./mood-mapper/mood-mapper.module').then(m=>m.MoodMapperModule)
            },

        ],

    },
    { path: 'server-error', component: PageNotFoundServerErrorComponent },
    { path: '404', component: PageNotFoundComponent },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
