import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimuladoList } from './pages/simulado-list/simulado-list';

const routes: Routes = [
  {
    path: '', // Acessado via: /simulados
    component: SimuladoList
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimuladosRoutingModule { }
