// 1. IMPORTE O ViewportScroller e o HostListener
import { Component, OnInit, inject, HostListener } from '@angular/core';
import { ViewportScroller, CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { QuestionService } from '../../services/questionService';
import { PageableResponse, Questao } from '../../../../core/models/Question'; 
import { QuestionFilter } from '../../components/question-filter/question-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { MarkdownComponent } from 'ngx-markdown'; 

@Component({
  selector: 'app-question-list',
  standalone: true, 
  imports: [
    CommonModule, 
    RouterModule,
    QuestionFilter, 
    PaginationComponent,
    MarkdownComponent 
  ],
  templateUrl: './question-list.html',
  styleUrls: ['./question-list.css'] 
})
export class QuestionList implements OnInit { 

  private questionService = inject(QuestionService);
  // 2. INJETE O SCROLLER
  private scroller = inject(ViewportScroller); 

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
    // Só salva a rolagem se não estivermos carregando (evita salvar '0' ao mudar de página)
    if (!this.isLoading) {
      this.questionService.cachedScroll = window.scrollY;
    }
  }

  ngOnInit(): void {
    // 4. VERIFICA O "BAÚ"
    if (this.questionService.lastResponse && this.questionService.cachedFilters) {
      // TEMOS ESTADO SALVO!
      this.isLoading = false; // Não precisa carregar
      
      // Restaura tudo do serviço
      const response = this.questionService.lastResponse;
      this.questoes = response.content;
      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;
      this.currentPage = response.number;
      this.currentFilters = this.questionService.cachedFilters;

      // Restaura a posição da rolagem
      // Usamos setTimeout(..., 10) para garantir que o HTML foi renderizado
      setTimeout(() => {
        this.scroller.scrollToPosition([0, this.questionService.cachedScroll]);
      }, 10);

    } else {
      // NÃO TEM ESTADO SALVO (Primeira vez na página)
      this.fetchQuestoes(); 
    }
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
    this.currentFilters.termo = termo.trim(); 
    this.currentPage = 0; // Reseta para a primeira página
    this.fetchQuestoes();
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