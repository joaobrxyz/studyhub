import { Component, OnInit, inject, HostListener, ViewChild } from '@angular/core';
import { ViewportScroller, CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; 
import { QuestionService } from '../../services/questionService';
import { PageableResponse, Questao } from '../../../../core/models/Question'; 
import { QuestionFilter } from '../../components/question-filter/question-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { MarkdownComponent } from 'ngx-markdown';
import { RemoveImageMarkdownPipe } from '../../../../shared/pipes/remove-image-markdown-pipe';
import { KatexPipe } from '../../../../shared/pipes/katex.pipe';

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
  // 2. INJETE O SCROLLER
  private scroller = inject(ViewportScroller); 
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private isFirstLoad = true;
  isRestoring = false;

  @ViewChild(QuestionFilter) filtroComponent!: QuestionFilter;

  questoes: Questao[] = [];
  isLoading = true; 
  totalElements = 0;
  totalPages = 0;
  currentPage = 0; 
  pageSize = 10;   
  currentFilters: any = {};

  // 3. SALVA A ROLAGEM
  @HostListener('window:scroll')  
  onScroll() {
    // Só salva se NÃO estiver carregando E NÃO estiver restaurando
    if (!this.isLoading && !this.isRestoring) {
      this.questionService.cachedScroll = window.scrollY;
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const termoUrl = params['termo'] || null;

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
    
    // Em vez de buscar direto, nós navegamos para atualizar a URL.
    // O 'ngOnInit' vai perceber a mudança na URL e chamar o 'fetchQuestoes' sozinho.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { termo: termoLimpo || null }, // Se vazio, remove o param da URL
      queryParamsHandling: 'merge', // Mantém outros filtros (opcional, ou remova para resetar tudo)
      replaceUrl: true // Substitui o histórico para não criar "voltar" infinito
    });
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
}