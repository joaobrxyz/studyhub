import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location, ViewportScroller } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Questao } from '../../../../core/models/Question';
import { QuestionService } from '../../services/questionService';
import { QuestionCard } from '../../components/question-card/question-card'; // Importe o novo componente

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    QuestionCard // Adicione aos imports
  ],
  templateUrl: './question-detail.html',
  styleUrls: ['./question-detail.css']
})
export class QuestionDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private questionService = inject(QuestionService);
  private location = inject(Location); 
  private scroller = inject(ViewportScroller);

  questao: Questao | null = null;
  isLoading = true;

  // Controle local da resposta
  alternativaSelecionada: string | null = null; 
  mostrarResultado = false;
  ehCorreto = false;

  ngOnInit(): void {
    this.scroller.scrollToPosition([0, 0]);
    const questaoId = this.route.snapshot.paramMap.get('id');

    if (questaoId) {
      this.questionService.getQuestaoById(questaoId).subscribe({
        next: (data) => {
          this.questao = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao buscar questão:', err);
          this.isLoading = false;
        }
      });
    }
  }

  // Função chamada pelo botão responder
  verificarResposta(): void {
    if (!this.questao || this.alternativaSelecionada === null) return;
    
    // Calcula o resultado
    this.ehCorreto = (this.alternativaSelecionada === this.questao.resposta);
    
    // Ativa os visuais no componente filho via [Inputs]
    this.mostrarResultado = true;
  }

  voltar(): void {
    this.location.back();
  }
}