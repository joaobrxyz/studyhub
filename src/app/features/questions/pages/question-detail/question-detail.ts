import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location, ViewportScroller } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Questao } from '../../../../core/models/Question';
import { QuestionService } from '../../services/questionService';
import { QuestionCard } from '../../components/question-card/question-card'; 
import { Simulado, SimuladoService } from '../../../simulados/services/simulado';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../../../../core/services/auth';
import { SimuladoAddQuestionModal } from '../../../simulados/components/simulado-add-question-modal/simulado-add-question-modal';
import { SimuladoCreateModal } from '../../../simulados/components/simulado-create-modal/simulado-create-modal';
import { take } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    QuestionCard,
    SimuladoAddQuestionModal, 
    SimuladoCreateModal
  ],
  templateUrl: './question-detail.html',
  styleUrls: ['./question-detail.css']
})
export class QuestionDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private questionService = inject(QuestionService);
  private simuladoService = inject(SimuladoService);
  private authService = inject(Auth);
  private location = inject(Location); 
  private scroller = inject(ViewportScroller);

  questao: Questao | null = null;
  isLoading = true;

  // Controle local da resposta
  alternativaSelecionada: string | null = null; 
  mostrarResultado = false;
  ehCorreto = false;

  // Variáveis para o Modal
  exibirModalSelecao = false;
  exibirModalCriacao = false;
  questaoSelecionadaId: string | null = null;

  ngOnInit(): void {
    this.scroller.scrollToPosition([0, 0]);
    const questaoId = this.route.snapshot.paramMap.get('id');

    if (questaoId) {
      this.questionService.getQuestaoById(questaoId)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.questao = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao buscar questão:', err);
          this.isLoading = false;

          Swal.fire({
             icon: 'error',
             title: 'Questão não encontrada',
             text: 'O link que você acessou não existe ou foi removido.'
          }).then(() => {
             // Redireciona para a lista de questões
             this.router.navigate(['/questoes']);
          });
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

  abrirModalSimulado() {
    if (!this.questao) return;

    // 1. Verificação de Login
    const token = this.authService.getToken();
    if (!token) {
      this.exibirAvisoLogin();
      return;
    }

    // 2. Apenas ativa a flag. O componente interno cuidará do resto!
    this.questaoSelecionadaId = this.questao.id;
    this.exibirModalSelecao = true;
  }

  adicionarAoSimulado(simulado: Simulado) {
    this.exibirModalSelecao = false;
    this.questaoSelecionadaId = null;
  }
  
  irParaCriarSimulado() {
    this.exibirModalSelecao = false;
    this.exibirModalCriacao = true;
  }

  onSimuladoCriado(dados: any) {
    this.exibirModalCriacao = false;
    Swal.fire('Sucesso!', 'Simulado criado. Agora você pode adicionar a questão.', 'success');
  }

  private exibirAvisoLogin() {
    Swal.fire({
      title: 'Login necessário',
      text: 'Você precisa estar logado para salvar questões.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Fazer Login'
    }).then((result) => {
      if (result.isConfirmed) this.router.navigate(['/auth/login']);
    });
  }
}