import { Component, Output, EventEmitter, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/questionService';

@Component({
  selector: 'app-question-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-filter.html',
  styleUrls: ['./question-filter.css']
})
export class QuestionFilter {

  @Output() filtrosMudaram = new EventEmitter<any>();
  private questionService = inject(QuestionService); 

  filtrosEstaticos = {
    disciplina: {
      Matematica: false,
      Portugues: false,
      Historia: false,
      Fisica: false,
      Quimica: false
    },
    instituicao: {
      Enade: false,
      Enem: false,
      Fuvest: false 
    },
    ano: {
      '2025': false,
      '2024': false,
      '2023': false
    },
    dificuldade: {
      FACIL: false,
      MEDIO: false,
      DIFICIL: false
    }
  };

  // O mapa de tradução para os valores corretos da API
  private disciplinaMap: { [key: string]: string } = {
    Matematica: 'Matemática',
    Portugues: 'Português',
    Historia: 'História',
    Fisica: 'Física',
    Quimica: 'Química'
  };

  outrasDisciplinas: any[] = [{ checked: false, value: '' }];
  outrasInstituicoes: any[] = [{ checked: false, value: '' }];
  outrosAnos: any[] = [{ checked: false, value: '' }];
  
  showDisciplinaWarning = false;
  showInstituicaoWarning = false;
  showAnoWarning = false;
  
  constructor() { }

  limparFiltros() {
    // 1. Reseta os checkboxes estáticos (incluindo 'dificuldade')
    this.filtrosEstaticos = {
      disciplina: {
        Matematica: false,
        Portugues: false,
        Historia: false,
        Fisica: false,
        Quimica: false
      },
      instituicao: {
        Fuvest: false,
        Enem: false,
        Enade: false
      },
      ano: {
        '2025': false,
        '2024': false,
        '2023': false
      },
      // ADICIONADO O RESET DE DIFICULDADE
      dificuldade: {
        FACIL: false,
        MEDIO: false,
        DIFICIL: false
      }
    };
    

    // Reseta os arrays dinâmicos
    this.outrasDisciplinas = [{ checked: false, value: '' }];
    this.outrasInstituicoes = [{ checked: false, value: '' }];
    this.outrosAnos = [{ checked: false, value: '' }];

    this.questionService.cachedFilters = null;
    this.questionService.lastResponse = null;
    this.questionService.cachedScroll = 0;

    // Avisa o componente pai que os filtros mudaram (para "vazio")
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    
    const payload = {
      disciplinas: [] as string[], 
      instituicoes: [] as string[],
      anos: [] as string[],
      dificuldades: [] as string[] 
    };

    const disciplinasFinais: string[] = [];
    const instituicoesFinais: string[] = [];
    const anosFinais: string[] = [];
    const dificuldadesFinais: string[] = [];


    // Coleta Estáticos de Disciplina
    const disciplinasEstaticas = Object.entries(this.filtrosEstaticos.disciplina)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => this.disciplinaMap[key] || key);
    disciplinasFinais.push(...disciplinasEstaticas);

    // Coleta Dinâmicos de Disciplina
    this.outrasDisciplinas.forEach(item => {
      if (item.checked && item.value.trim() !== '') { 
        disciplinasFinais.push(item.value.trim()); 
      }
    });

    // Coleta Estáticos de Instituição
    const instituicoesEstaticas = Object.entries(this.filtrosEstaticos.instituicao)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key); 
    instituicoesFinais.push(...instituicoesEstaticas);

    // Coleta Dinâmicos de Instituição
    this.outrasInstituicoes.forEach(item => {
      if (item.checked && item.value.trim() !== '') {
        instituicoesFinais.push(item.value.trim());
      }
    });

    // Coleta Estáticos de Ano
    const anosEstaticos = Object.entries(this.filtrosEstaticos.ano)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key); 
    anosFinais.push(...anosEstaticos);

    // Coleta Dinâmicos de Ano
    this.outrosAnos.forEach(item => {
      const valorComoString = item.value ? item.value.toString() : '';
      if (item.checked && valorComoString.trim() !== '') { 
        anosFinais.push(valorComoString.trim()); 
      }
    });

    // Coleta Estáticos de Dificuldade
    const dificuldadesEstaticas = Object.entries(this.filtrosEstaticos.dificuldade)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key); // key já é 'FACIL', 'MEDIO', 'DIFICIL'
    dificuldadesFinais.push(...dificuldadesEstaticas);


    // --- ATRIBUIÇÃO FINAL ---
    if (disciplinasFinais.length > 0) {
      payload.disciplinas = disciplinasFinais;
    }
    if (instituicoesFinais.length > 0) {
      payload.instituicoes = instituicoesFinais;
    }
    if (anosFinais.length > 0) {
      payload.anos = anosFinais;
    }
    if (dificuldadesFinais.length > 0) {
      payload.dificuldades = dificuldadesFinais; // Envia o array
    }
    
    this.filtrosMudaram.emit(payload);
  }
  
  // --- (O resto das suas funções 'onOutroInput', 'onCheckboxToggle', etc.) ---
  onOutroInput(tipo: 'disciplina' | 'instituicao' | 'ano', index: number) {
    let array = this.getArrayByType(tipo);
    let item = array[index];
    const valorComoString = item.value ? item.value.toString() : '';
    if (item.checked && valorComoString.trim() !== '' && index === array.length - 1) {
      array.push({ checked: false, value: '' });
    }
  }

  onCheckboxToggle(tipo: 'disciplina' | 'instituicao' | 'ano', index: number) {
    this.hideWarning(tipo);
    let array = this.getArrayByType(tipo);
    let item = array[index];
    if (!item.checked && array.length > 1) {
      array.splice(index, 1);
    }
  }

  checkDisabledHover(tipo: 'disciplina' | 'instituicao' | 'ano', index: number) {
    let array = this.getArrayByType(tipo);
    if (!array[index].checked) {
      if (tipo === 'disciplina') this.showDisciplinaWarning = true;
      if (tipo === 'instituicao') this.showInstituicaoWarning = true;
      if (tipo === 'ano') this.showAnoWarning = true;
    }
  }

  hideWarning(tipo: 'disciplina' | 'instituicao' | 'ano') {
    if (tipo === 'disciplina') this.showDisciplinaWarning = false;
    if (tipo === 'instituicao') this.showInstituicaoWarning = false;
    if (tipo === 'ano') this.showAnoWarning = false;
  }

  private getArrayByType(tipo: 'disciplina' | 'instituicao' | 'ano'): any[] {
    if (tipo === 'disciplina') return this.outrasDisciplinas;
    if (tipo === 'instituicao') return this.outrasInstituicoes;
    return this.outrosAnos;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}