import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

export const AppRoutes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/login',
                pathMatch: 'full'
            },
            {
                path: 'vuelo',
                loadChildren: () => import('./vuelo/vuelo.module').then(m => m.vueloModule)
            }
        ]
    },
    {
        path: 'login',
        component: LoginComponent,
    }
];
