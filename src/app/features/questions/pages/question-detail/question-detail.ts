import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { Questao } from '../../../../core/models/Question';
import { QuestionService } from '../../services/questionService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MarkdownComponent,
    FormsModule 
  ],
  templateUrl: './question-detail.html',
  styleUrls: ['./question-detail.css']
})
export class QuestionDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private questionService = inject(QuestionService);
  private location = inject(Location); 

  questao: Questao | null = null;
  isLoading = true;
  
  // Esta é a variável que guarda os dados formatados
  alternativasFormatadas: any[] = []; 

  alternativaSelecionada: string | null = null; 
  mostrarResultado = false;
  ehCorreto = false;

  ngOnInit(): void {
    // 1. Pega o ID da URL
    const questaoId = this.route.snapshot.paramMap.get('id');

    if (questaoId) {
      // 2. Chama o serviço para buscar a questão
      this.questionService.getQuestaoById(questaoId).subscribe({
        next: (data) => {
          this.questao = data;
          
          // 3. A LÓGICA DE FORMATAÇÃO
          // Transforma ["A) Texto...", "B) Texto..."]
          // em [ {letra: 'A', texto: 'Texto...'}, {letra: 'B', texto: 'Texto...'} ]
          this.alternativasFormatadas = data.alternativas.map(alt => {
            const parts = alt.split(') '); // Divide no "A) "
            return {
              letra: parts[0], // "A"
              texto: parts.slice(1).join(') ') // Pega o resto do texto
            };
          });
          // --- FIM DA LÓGICA ---

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao buscar questão:', err);
          this.isLoading = false;
        }
      });
    }
  }

  // Função para o botão "Responder"
  verificarResposta(): void {
    if (!this.questao || this.alternativaSelecionada === null) {
      return; 
    }
    // Compara o índice selecionado (ex: "2") com a resposta da API (ex: "2")
    this.ehCorreto = (this.alternativaSelecionada === this.questao.resposta);
    this.mostrarResultado = true;
  }

  // Função para o botão "Voltar"
  voltar(): void {
    this.location.back();
  }
}