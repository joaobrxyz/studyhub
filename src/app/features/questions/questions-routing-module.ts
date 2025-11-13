import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionList } from './pages/question-list/question-list';
import { QuestionDetail } from './pages/question-detail/question-detail';


const routes: Routes = [
  {
    path: '', // Caminho vazio significa: "é a raiz deste módulo" (/questoes)
    component: QuestionList
  },
 { path: ':id', component: QuestionDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionsRoutingModule { }