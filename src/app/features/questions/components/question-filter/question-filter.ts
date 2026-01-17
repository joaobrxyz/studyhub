import { Component, Output, EventEmitter, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/questionService';
import { UserService } from '../../../profile/services/user-service';
import { Auth } from '../../../../core/services/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs';

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

  @Input() exibirBotoes: boolean = true;

  private userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(Auth);

  isPremium: boolean = false;
  estaLogado: boolean = false;

  ngOnInit() {
  // Verifica se está logado
  this.estaLogado = this.authService.isLoggedIn();

  // Se estiver logado, busca o status premium (seu código que já existe)
  if (this.estaLogado) {
    this.userService.getUsuarioLogado()
      .pipe(take(1))
      .subscribe(user => {
        this.isPremium = user?.premium || false;
      });
  }
}

  irParaPremium() {
    // Navega direto para a página de assinatura
    this.router.navigate(['/premium']);
  }

  filtrosEstaticos = {
    premium: {
    apenasErros: false,
    comResolucao: false,
    comVideo: false
  },
    disciplina: {
      Matematica: false,
      Linguagens: false,
      Humanas: false,
      Fisica: false,
      Quimica: false
    },
    instituicao: {
      Enade: false,
      Enem: false,
      FGV: false 
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
    Linguagens: 'Linguagens',
    Humanas: 'Humanas',
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

  public forcarSelecao(filtros: any) {
    if (!filtros) return;

    // Restaurar Filtros Premium
    this.filtrosEstaticos.premium.apenasErros = !!filtros.apenasErros;
    this.filtrosEstaticos.premium.comResolucao = !!filtros.comResolucao;
    this.filtrosEstaticos.premium.comVideo = !!filtros.comVideo;

    // Resetar arrays dinâmicos para evitar duplicação
    this.outrasDisciplinas = [{ checked: false, value: '' }];
    this.outrasInstituicoes = [{ checked: false, value: '' }];
    this.outrosAnos = [{ checked: false, value: '' }];

    // 1. DISCIPLINAS
    if (filtros.disciplinas) {
      filtros.disciplinas.forEach((disc: string) => {
        // Procura a chave no mapa (Ex: busca chave para valor "Matemática")
        const chave = Object.keys(this.disciplinaMap).find(key => this.disciplinaMap[key] === disc);
        
        if (chave) {
          // É estático (ex: Matematica)
          // @ts-ignore
          this.filtrosEstaticos.disciplina[chave] = true;
        } else {
          // É dinâmico
          this.outrasDisciplinas.unshift({ checked: true, value: disc });
        }
      });
    }

    // 2. INSTITUIÇÕES
    if (filtros.instituicoes) {
      filtros.instituicoes.forEach((inst: string) => {
        // @ts-ignore
        if (this.filtrosEstaticos.instituicao.hasOwnProperty(inst)) {
           // @ts-ignore
           this.filtrosEstaticos.instituicao[inst] = true;
        } else {
           this.outrasInstituicoes.unshift({ checked: true, value: inst });
        }
      });
    }

    // 3. ANOS
    if (filtros.anos) {
      filtros.anos.forEach((ano: string) => {
        // @ts-ignore
        if (this.filtrosEstaticos.ano.hasOwnProperty(ano)) {
           // @ts-ignore
           this.filtrosEstaticos.ano[ano] = true;
        } else {
           this.outrosAnos.unshift({ checked: true, value: ano });
        }
      });
    }

    // 4. DIFICULDADE
    if (filtros.dificuldades) {
      filtros.dificuldades.forEach((dif: string) => {
         // @ts-ignore
         if (this.filtrosEstaticos.dificuldade.hasOwnProperty(dif)) {
           // @ts-ignore
           this.filtrosEstaticos.dificuldade[dif] = true;
         }
      });
    }
  }

  limparFiltros() {
    this.filtrosEstaticos.premium = {
    apenasErros: false,
    comResolucao: false,
    comVideo: false
  };
    // 1. Reseta os checkboxes estáticos (incluindo 'dificuldade')
    this.filtrosEstaticos = {
      premium: {
      apenasErros: false,
      comResolucao: false,
      comVideo: false
      },
      disciplina: {
        Matematica: false,
        Linguagens: false,
        Humanas: false,
        Fisica: false,
        Quimica: false
      },
      instituicao: {
        FGV: false,
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
      dificuldades: [] as string[],
      apenasErros: this.filtrosEstaticos.premium.apenasErros,
      comResolucao: this.filtrosEstaticos.premium.comResolucao,
      comVideo: this.filtrosEstaticos.premium.comVideo
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

    if (!this.exibirBotoes) {
      this.aplicarFiltros();
    }
  }

  onCheckboxToggle(tipo: 'disciplina' | 'instituicao' | 'ano', index: number) {
    this.hideWarning(tipo);
    let array = this.getArrayByType(tipo);
    let item = array[index];
    if (!item.checked && array.length > 1) {
      array.splice(index, 1);
    }

    if (!this.exibirBotoes) {
      this.aplicarFiltros();
    }
  }

  onStaticChange() {
    if (!this.exibirBotoes) {
      this.aplicarFiltros();
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