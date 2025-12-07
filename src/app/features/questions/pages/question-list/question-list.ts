import { Component, OnInit, inject, HostListener, ViewChild } from '@angular/core';
import { ViewportScroller, CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; 
import { QuestionService } from '../../services/questionService';
import { Simulado, SimuladoService } from '../../../simulados/services/simulado';
import { PageableResponse, Questao } from '../../../../core/models/Question'; 
import { QuestionFilter } from '../../components/question-filter/question-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { MarkdownComponent } from 'ngx-markdown';
import { RemoveImageMarkdownPipe } from '../../../../shared/pipes/remove-image-markdown-pipe';
import { KatexPipe } from '../../../../shared/pipes/katex.pipe';
import Swal from 'sweetalert2';
import { Auth } from '../../../../core/services/auth';

// Permite usar o JS do Bootstrap diretamente
declare var bootstrap: any;

@Component({
  selector: 'app-question-list',
  standalone: true, 
  imports: [
    CommonModule, 
    RouterModule,
    QuestionFilter, 
    PaginationComponent,
    MarkdownComponent,
    KatexPipe,
    RemoveImageMarkdownPipe
  ],
  templateUrl: './question-list.html',
  styleUrls: ['./question-list.css'] 
})
export class QuestionList implements OnInit { 

  private questionService = inject(QuestionService);
  private simuladoService = inject(SimuladoService);
  private authService = inject(Auth);
  private scroller = inject(ViewportScroller); 
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private isFirstLoad = true;
  isRestoring = false;

  @ViewChild(QuestionFilter) filtroComponent!: QuestionFilter;

  termoBuscaBarra: string | null = null;
  questoes: Questao[] = [];
  isLoading = true; 
  totalElements = 0;
  totalPages = 0;
  currentPage = 0; 
  pageSize = 10;   
  currentFilters: any = {};
  mostrarFiltrosMobile = false;

  // VARIÁVEIS PARA O MODAL DE SIMULADO
  simuladosUsuario: Simulado[] = [];
  questaoSelecionadaId: string | null = null;
  modalInstance: any;

  // 3. SALVA A ROLAGEM
  @HostListener('window:scroll')  
  onScroll() {
    // Só salva se NÃO estiver carregando E NÃO estiver restaurando
    if (!this.isLoading && !this.isRestoring) {
      this.questionService.cachedScroll = window.scrollY;
    }
  }

  // Função para abrir/fechar o filtro
  toggleFiltrosMobile() {
    this.mostrarFiltrosMobile = !this.mostrarFiltrosMobile;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const termoUrl = params['termo'] || null;

      this.termoBuscaBarra = termoUrl;

      // Se for a primeira carga E tivermos cache, restauramos.
      if (this.isFirstLoad && this.questionService.lastResponse) {
        this.isFirstLoad = false; // Já carregou
        this.restoreFromCache();
      } 
      else {
        // Se NÃO for a primeira carga (ou seja, o usuário está pesquisando agora),
        // ou se não tiver cache, buscamos dados novos com base na URL.
        this.isFirstLoad = false;
        
        // Atualiza o filtro de termo com o que está na URL (pode ser null, o que é correto para limpar)
        this.currentFilters.termo = termoUrl;
        this.currentPage = 0;
        this.fetchQuestoes(); 
      }
    });
  }

  restoreFromCache() {
    // 1. ATIVA A TRAVA: "Pare de salvar o scroll, vou mexer nele agora"
    this.isRestoring = true; 
    this.isLoading = false;

    const response = this.questionService.lastResponse;
    if (response) {
        this.questoes = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
    }
    // Restaura os filtros que estavam salvos
    this.currentFilters = this.questionService.cachedFilters || {};

    // Guarda o valor localmente para garantir
    const posicaoDestino = this.questionService.cachedScroll;

    setTimeout(() => {
      if (this.filtroComponent) {
        this.filtroComponent.forcarSelecao(this.currentFilters);
      }
    }, 50);

    // Primeiro Salto (Rápido)
    setTimeout(() => {
       window.scrollTo({ top: posicaoDestino, behavior: 'auto' });
    }, 100);

    // Segundo Salto (Correção Final e Destrava)
    setTimeout(() => {
       window.scrollTo({ top: posicaoDestino, behavior: 'auto' });
       
       // 2. SOLTA A TRAVA: "Pronto, pode voltar a salvar"
       // Pequeno delay extra para garantir que o evento de scroll do salto terminou
       setTimeout(() => { this.isRestoring = false; }, 100); 
       
    }, 600);
  }

  fetchQuestoes(): void {
    this.isLoading = true;
    
    // 5. SALVA O ESTADO ANTES DE BUSCAR
    this.questionService.cachedFilters = this.currentFilters;
    this.questionService.cachedPage = this.currentPage;

    const filtrosParaApi = {
      page: this.currentPage,
      size: this.pageSize,
      termo: this.currentFilters.termo || null,
      disciplinas: this.currentFilters.disciplinas || null,
      instituicoes: this.currentFilters.instituicoes || null,
      anos: this.currentFilters.anos || null,
      dificuldades: this.currentFilters.dificuldades || null 
    };

    this.questionService.getQuestoes(filtrosParaApi).subscribe({
      next: (response) => {
        this.questoes = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number; 
        
        // 6. SALVA A RESPOSTA NO "BAÚ"
        this.questionService.lastResponse = response;
        this.isLoading = false;

        // Ao carregar dados novos, rola para o topo (se não for restauração)
        // Se a página não for a que estava salva, rola para o topo
        if (this.currentPage !== this.questionService.cachedPage) {
           this.scroller.scrollToPosition([0, 0]);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar questões:', err);
        this.isLoading = false;
      }
    });
  }

  // (onSearch está correto, ele chama fetchQuestoes que agora salva o estado)
  onSearch(termo: string): void {
    const termoLimpo = termo.trim();

    this.termoBuscaBarra = termoLimpo;
    
    // Em vez de buscar direto, nós navegamos para atualizar a URL.
    // O 'ngOnInit' vai perceber a mudança na URL e chamar o 'fetchQuestoes' sozinho.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { termo: termoLimpo || null }, // Se vazio, remove o param da URL
      queryParamsHandling: 'merge', // Mantém outros filtros (opcional, ou remova para resetar tudo)
      replaceUrl: true // Substitui o histórico para não criar "voltar" infinito
    });
  }

  limparBusca(): void {
  this.termoBuscaBarra = null; // Limpa a variável visual
  this.onSearch(''); // Dispara a busca vazia para limpar a URL e recarregar a lista
}

  // (onFiltrosMudaram está correto)
  onFiltrosMudaram(novosFiltros: any): void {
    this.currentFilters = {
      termo: this.currentFilters.termo, // Mantém o termo de busca se houver
      ...novosFiltros 
    };
    this.currentPage = 0; // Reseta para a primeira página
    this.fetchQuestoes();
  }

  // (onPaginaMudou está correto)
  onPaginaMudou(novaPagina: number): void {
    this.currentPage = novaPagina; // O componente de paginação já manda em base 0
    this.fetchQuestoes();
  }

  abrirModalSimulado(questaoId: string) {
    this.questaoSelecionadaId = questaoId;

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
          // Redireciona para sua tela de login
          this.router.navigate(['/auth/login']); 
        }
      });
      return; // Para tudo aqui se não estiver logado
    }
    
    // 1. Busca os simulados do usuário antes de abrir
    this.simuladoService.listarSimulados().subscribe({
      next: (dados) => {
        // Ordena por data (mais recente primeiro)
        this.simuladosUsuario = dados.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );

        // 2. Abre o Modal usando Bootstrap JS
        const modalElement = document.getElementById('modalAddSimulado');
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
    if (!this.questaoSelecionadaId) return;

    // Verifica se a questão já está no simulado
    if (simulado.questoes && simulado.questoes.includes(this.questaoSelecionadaId)) {
      Swal.fire('Aviso', 'Esta questão já está neste simulado.', 'info');
      return;
    }

    // Adiciona o ID na lista
    const novaLista = [...(simulado.questoes || []), this.questaoSelecionadaId];

    // Prepara o objeto para atualizar
    const payload = {
      nome: simulado.nome,
      descricao: simulado.descricao,
      questoes: novaLista
    };

    // Chama o serviço para salvar
    this.simuladoService.atualizarSimulado(simulado.id, payload).subscribe({
      next: () => {
        // Fecha o modal
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