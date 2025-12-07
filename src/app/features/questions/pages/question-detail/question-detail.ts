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

declare var bootstrap: any;

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
  simuladosUsuario: Simulado[] = [];
  modalInstance: any;

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

    // VERIFICAÇÃO DE LOGIN
    const token = this.authService.getToken();
    if (!token) {
      Swal.fire({
        title: 'Login necessário',
        text: 'Você precisa estar logado para criar simulados e salvar questões.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Fazer Login',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Redireciona para tela de login
          this.router.navigate(['/auth/login']); 
        }
      });
      return; // Para tudo aqui se não estiver logado
    }
    
    // 1. Busca os simulados do usuário
    this.simuladoService.listarSimulados().subscribe({
      next: (dados) => {
        // Ordena por data (mais recente primeiro)
        this.simuladosUsuario = dados.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );

        // 2. Abre o Modal
        const modalElement = document.getElementById('modalAddSimuladoDetail'); // ID único para evitar conflitos
        if (modalElement) {
          this.modalInstance = new bootstrap.Modal(modalElement);
          this.modalInstance.show();
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erro', 'Não foi possível carregar seus simulados.', 'error');
      }
    });
  }

  adicionarAoSimulado(simulado: Simulado) {
    if (!this.questao) return;

    // Verifica duplicidade
    if (simulado.questoes && simulado.questoes.includes(this.questao.id)) {
      Swal.fire('Aviso', 'Esta questão já está neste simulado.', 'info');
      return;
    }

    // Adiciona o ID na lista
    const novaLista = [...(simulado.questoes || []), this.questao.id];

    const payload = {
      nome: simulado.nome,
      descricao: simulado.descricao,
      questoes: novaLista
    };

    this.simuladoService.atualizarSimulado(simulado.id, payload).subscribe({
      next: () => {
        if (this.modalInstance) this.modalInstance.hide();
        
        Swal.fire({
          title: 'Adicionada!',
          text: `Questão adicionada ao simulado "${simulado.nome}".`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erro', 'Falha ao adicionar questão.', 'error');
      }
    });
  }
  
  irParaCriarSimulado() {
    if (this.modalInstance) this.modalInstance.hide();
    this.router.navigate(['/simulados/criar']);
  }
}