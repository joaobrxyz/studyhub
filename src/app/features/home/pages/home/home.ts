import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { QuestionService } from '../../../questions/services/questionService';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private router = inject(Router);
  private questionService = inject(QuestionService); 

  ngOnInit(): void {
    // Sempre que a Home for carregada, limpamos o "baú de memória"
    this.questionService.cachedFilters = null;
    this.questionService.cachedPage = 0;
    this.questionService.cachedScroll = 0;
    this.questionService.lastResponse = null;
  }


  // Recebe o evento (opcional, caso venha do botão)
  buscarQuestoes(termo: string, event?: Event) {
    
    // 1. PREVINE O RELOAD DA PÁGINA
    if (event) {
      event.preventDefault();
    }

    const termoLimpo = termo.trim();

    if (termoLimpo) {
      this.router.navigate(['/questoes'], { 
        queryParams: { termo: termoLimpo } 
      });
    } else {
      this.router.navigate(['/questoes']);
    }
  }
}
