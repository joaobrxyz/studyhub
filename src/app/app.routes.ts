import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { NotFound } from './features/not-found/not-found';
import { SimuladoResponder } from './features/simulados/pages/simulado-responder/simulado-responder';
import { SimuladoEditar } from './features/simulados/pages/simulado-editar/simulado-editar';

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
    then(m => m.ProfileModule)
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
    path: 'simulados/:id', 
    component: SimuladoResponder,
    canActivate: [authGuard] 
  },
  {
    path: 'simulados/editar/:id',
    component: SimuladoEditar,
    canActivate: [authGuard]
  },
  {
    path: '**',
    component: NotFound
  },

 
];