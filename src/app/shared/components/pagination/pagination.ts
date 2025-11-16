import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule], // Precisa de CommonModule para *ngFor e *ngIf
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent implements OnChanges {

  // ENTRADA: O componente pai (list) nos diz qual é a página atual
  @Input() currentPage: number = 0; // base 0
  
  // ENTRADA: O componente pai (list) nos diz o total de páginas
  @Input() totalPages: number = 0;

  // SAÍDA: O componente "grita" para o pai qual página foi clicada
  @Output() paginaMudou = new EventEmitter<number>();

  // Variável interna para guardar os números (ex: [1, 2, '...', 77, 78])
  pages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Recalcula as páginas toda vez que o totalPages (vindo da API) mudar
    if (changes['totalPages'] || changes['currentPage']) {
      this.pages = this.calculatePages();
    }
  }

  // A função que EMITE o evento para o pai
  mudarPagina(page: number | string): void {
    // Se clicou em '...' não faz nada
    if (typeof page === 'string') {
      return;
    }
    
    // Converte de base 1 (na tela) para base 0 (na API)
    const newPageBase0 = page - 1; 

    if (newPageBase0 !== this.currentPage && newPageBase0 >= 0 && newPageBase0 < this.totalPages) {
      this.paginaMudou.emit(newPageBase0);
    }
  }

  // A "mágica" para calcular os números e as elipses (...)
  private calculatePages(): (number | string)[] {
    if (this.totalPages <= 7) {
      // Se tiver 7 ou menos páginas, mostra tudo
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pageBase1 = this.currentPage + 1;
    const pagesToShow: (number | string)[] = [];

    // Lógica para adicionar '...'
    if (pageBase1 < 5) {
      // Caso 1: Estamos no início (1, 2, 3, 4, ..., 78)
      pagesToShow.push(1, 2, 3, 4, 5, '...', this.totalPages);
    } else if (pageBase1 > this.totalPages - 4) {
      // Caso 2: Estamos no final (1, ..., 75, 76, 77, 78)
      pagesToShow.push(1, '...', this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
    } else {
      // Caso 3: Estamos no meio (1, ..., 10, 11, 12, ..., 78)
      pagesToShow.push(1, '...', pageBase1 - 1, pageBase1, pageBase1 + 1, '...', this.totalPages);
    }

    return pagesToShow;
  }
}