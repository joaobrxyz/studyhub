import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './pages/login/login';

const routes: Routes = [
  {
    path: 'login', // Acessado via: /auth/login
    component: Login
  },
  {
    path: 'register', // Acessado via: /auth/register
    // component: RegisterComponent (se já tiver criado)
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },
  {
    path: '', // Se o usuário acessar só "/auth"...
    redirectTo: 'login', // ...manda ele para "/auth/login"
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }