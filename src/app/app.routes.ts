import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { premiumGuard } from './core/guards/premium-guard';
import { NotFound } from './features/not-found/not-found';
import { SimuladoResponder } from './features/simulados/pages/simulado-responder/simulado-responder';
import { SimuladoEditar } from './features/simulados/pages/simulado-editar/simulado-editar';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/pages/reset-password/reset-password';
import { Dashboard } from './features/dashboard/dashboard';
import { PremiumPlan } from './features/premium/pages/premium-plan/premium-plan';
import { SimuladoSelection } from './features/simulados/pages/simulado-selection/simulado-selection';
import { SimuladosCreate } from './features/simulados/pages/simulado-create/simulados-create';
import { SimuladosBiblioteca } from './features/simulados/pages/simulados-biblioteca/simulados-biblioteca';
import { SimuladoDesempenho } from './features/simulados/pages/simulado-desempenho/simulado-desempenho';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home/home').then( 
        (c) => c.Home
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then((m) => m.AuthModule), 
  },

  {
    path: 'perfil',
    loadChildren: () =>
      import('./features/profile/services/profile-module').
    then(m => m.ProfileModule),
    canActivate: [authGuard]
  },


  {
    path: 'questoes',
    loadChildren: () =>
      import('./features/questions/questions-module').then(
        (m) => m.QuestionsModule
      ),
  },
  {
    path: 'simulados',
    loadChildren: () =>
      import('./features/simulados/simulados-module').then(
        (m) => m.SimuladosModule
      ),
    canActivate: [authGuard], 
  },
  {
    path: 'simulados/novo',
    component: SimuladoSelection,
    canActivate: [authGuard]
  },
  {
    path: 'simulados/gerar',
    component: SimuladosCreate,
    canActivate: [authGuard]
  },
  {
    path: 'simulados/publicos',
    component: SimuladosBiblioteca,
    canActivate: [authGuard]
  },
  {
    path: 'simulados/editar/:id',
    component: SimuladoEditar,
    canActivate: [authGuard]
  },
  {
    path: 'simulados/desempenho/:id',
    component: SimuladoDesempenho,
    canActivate: [premiumGuard]
  },
  {
    path: 'simulados/:id', 
    component: SimuladoResponder,
    canActivate: [authGuard] 
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'premium',
    component: PremiumPlan,
    canActivate: [authGuard]
  },
  { path: 'auth/forgot-password', component: ForgotPassword },
  { path: 'auth/reset-password', component: ResetPassword },
  {
    path: '**',
    component: NotFound
  },

 
];