import {Routes,RouterModule} from '@angular/router'
import {LoginComponent} from './login/login.component'

export const routes:Routes=[
    {
        path:'',
        redirectTo:'todo',
        pathMatch:'full'
    },
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'todo',
        redirectTo:'todo'
    },
    {
        path:'tstest',
        redirectTo:'tstest'
    }
];

export const appRouting = RouterModule.forRoot(routes);