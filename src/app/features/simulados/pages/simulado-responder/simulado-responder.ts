import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SimuladoService, Simulado, RespostaDetalhe, TentativaSimulado, Dificuldade } from '../../services/simulado';
import { QuestionService } from '../../../questions/services/questionService';
import { Questao } from '../../../../core/models/Question';
import { QuestionCard } from '../../../questions/components/question-card/question-card';
import Swal from 'sweetalert2';
import { HistoricoService } from '../../../questions/services/historico-service';
import { RegistrarTentativaDTO } from '../../../questions/services/historico-service';
import { Auth } from '../../../../core/services/auth';
import { take } from 'rxjs';

@Component({
  selector: 'app-simulado-responder',
  standalone: true,
  imports: [CommonModule, RouterModule, QuestionCard], 
  templateUrl: './simulado-responder.html',
  styleUrls: ['./simulado-responder.css']
})
export class SimuladoResponder implements OnInit {
  
  route = inject(ActivatedRoute);
  router = inject(Router);
  simuladoService = inject(SimuladoService);
  questaoService = inject(QuestionService);
  historicoService = inject(HistoricoService);
  authService = inject(Auth);
  tentativaOriginalId: string | null = null;
  isModoReforco: boolean = false;
  isRevisao: boolean = false;

  simulado: Simulado | undefined;
  questoesDetalhadas: Questao[] = [];
  
  respostasUsuario: string[] = []; 
  
  isLoading: boolean = true;
  simuladoFinalizado: boolean = false;

  // Variáveis do Cronômetro
  segundos: number = 0;
  tempoFormatado: string = '00:00:00';
  cronometroVisivel: boolean = true;
  private intervalId: any;
  cronometroRecolhido: boolean = false;

  // Variáveis de Resultado
  resultado = {
    acertos: 0,
    total: 0,
    tempo: '',
    dificuldade: {
      facil: { acertos: 0, total: 0 },
      media: { acertos: 0, total: 0 },
      dificil: { acertos: 0, total: 0 }
    }
  };

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const id = this.route.snapshot.paramMap.get('id');
    const tentativaId = this.route.snapshot.queryParamMap.get('tentativaId');
    const modo = this.route.snapshot.queryParamMap.get('modo');

    this.isRevisao = modo === 'revisao';
    this.isModoReforco = modo === 'reforco';
    this.tentativaOriginalId = tentativaId;

    if (this.isRevisao && tentativaId) {
      this.isRevisao = true;
      this.carregarModoRevisao(id!, tentativaId);
      } else if (id) {
        this.carregarDados(id);
        this.iniciarCronometro();
      }
    }

  ngOnDestroy() {
    this.pararCronometro();
  }

  private carregarModoRevisao(simuladoId: string, tentativaId: string) {
    this.isLoading = true;
    this.simuladoFinalizado = true; // Já ativa o visual de correção
    this.cronometroVisivel = false;

    // 1. Busca os dados da tentativa salva
    this.simuladoService.buscarTentativaPorId(tentativaId)
    .pipe(take(1))
    .subscribe({
      next: (tentativa) => {
        // 2. Busca o simulado original para ter as questões
        this.simuladoService.buscarPorId(simuladoId)
        .pipe(take(1))
        .subscribe({
          next: (simulado) => {
            this.simulado = simulado;
            this.buscarQuestoesParaRevisao(simulado.questoes ?? [], tentativa);
          }
        });
      }
    });
  }

  private buscarQuestoesParaRevisao(ids: string[], tentativa: TentativaSimulado) {
    this.questaoService.buscarPorIds(ids)
    .pipe(take(1))
    .subscribe({
      next: (questoes) => {
        this.questoesDetalhadas = questoes;
        
        // 3. Preenche o array de respostas com o que foi salvo no banco
        this.respostasUsuario = questoes.map(q => {
          const resp = tentativa.detalhesRespostas.find(d => d.questaoId === q.id);
          return resp ? resp.alternativaMarcada : '';
        });

        this.calcularResultados(); // Atualiza os cards de acertos/erros no topo
        this.isLoading = false;
      }
    });
  }

  iniciarCronometro() {
    this.pararCronometro();
    this.intervalId = setInterval(() => {
      this.segundos++;
      this.atualizarTempoFormatado();
    }, 1000);
  }

  pararCronometro() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  atualizarTempoFormatado() {
    const horas = Math.floor(this.segundos / 3600);
    const minutos = Math.floor((this.segundos % 3600) / 60);
    const segs = this.segundos % 60;

    this.tempoFormatado = 
      `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  alternarVisibilidadeCronometro() {
    this.cronometroVisivel = !this.cronometroVisivel;
  }

  alternarRecolhimento() {
    this.cronometroRecolhido = !this.cronometroRecolhido;
  }

  carregarDados(simuladoId: string) {
    this.isLoading = true;

    // Define qual endpoint chamar: o de reforço ou o padrão
    const request$ = (this.isModoReforco && this.tentativaOriginalId) 
    ? this.simuladoService.buscarReforco(simuladoId, this.tentativaOriginalId)
    : this.simuladoService.buscarPorId(simuladoId);

    request$
    .pipe(take(1))
    .subscribe({
      next: (simuladoRetornado) => {
        this.simulado = simuladoRetornado;
        this.buscarQuestoes(this.simulado.questoes ?? []);
      },
      error: () => this.tratarErroCarregamento()
    });
  }

  private tratarErroCarregamento() {
    this.isLoading = false;
    Swal.fire({
      icon: 'error',
      title: 'Simulado Indisponível',
      text: 'Não conseguimos carregar os dados deste simulado.'
    }).then(() => {
      this.router.navigate(['/simulados']);
    });
  }

  private buscarQuestoes(ids: string[]) {
    if (ids && ids.length > 0) {
      this.questaoService.buscarPorIds(ids)
      .pipe(take(1))
      .subscribe({
        next: (questoesReais) => {
          this.questoesDetalhadas = questoesReais;
          this.respostasUsuario = new Array(questoesReais.length).fill('');
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      this.isLoading = false;
    }
  }

  private persistirTentativaNoBanco() {
    if (!this.simulado || !this.authService.isLoggedIn()) return;

    // Mapeia as respostas para o formato do Model
    const detalhes: RespostaDetalhe[] = this.questoesDetalhadas.map((q, i) => ({
      questaoId: q.id,
      alternativaMarcada: this.respostasUsuario[i],
      correta: this.respostasUsuario[i] === q.resposta,
      tempoGastoSegundos: Math.floor(this.segundos / this.questoesDetalhadas.length)
    }));

    const novaTentativa: TentativaSimulado = {
      usuarioId: '', // O Back-end injeta pelo token
      simuladoId: this.simulado.id,
      nomeSimulado: this.simulado.nome,
      dataFim: new Date(),
      tempoTotalSegundos: this.segundos,
      totalAcertos: this.resultado.acertos,
      totalQuestoes: this.resultado.total,
      porcentagemAcerto: 0, // Calculado no Java
      dificuldadeSimulado: this.simulado.dificuldade.toUpperCase() as Dificuldade,
      idTentativaOriginal: this.tentativaOriginalId || undefined,
      apenasErros: this.isModoReforco,
      detalhesRespostas: detalhes
    };
    this.simuladoService.salvarTentativa(this.simulado.id, novaTentativa)
    .pipe(take(1))
    .subscribe({
      next: (res) => console.log('Tentativa completa persistida!', res),
      error: (err) => console.error('Erro ao salvar tentativa', err)
    });
  }

  registrarResposta(index: number, alternativa: string) {
    if (this.simuladoFinalizado) return;
    
    // Salva a resposta na posição correta do array
    this.respostasUsuario[index] = alternativa;
    console.log(`Questão ${index} respondida com: ${alternativa}`);
  }

  finalizarSimulado() {
    // Lógica simples de validação
    const naoRespondidas = this.respostasUsuario.filter(r => !r).length;
    
    if (naoRespondidas > 0) {
      // Usa o SweetAlert para confirmar
      Swal.fire({
        title: 'Atenção',
        text: `Você deixou ${naoRespondidas} ${naoRespondidas > 1 ? 'questões' : 'questão'} em branco. Deseja finalizar mesmo assim?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, finalizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.processarFinalizacao(); // Chama a função que finaliza
        }
      });
    } else {
      // Se não tem pendências, finaliza direto
      this.processarFinalizacao();
    }
  }
  // Criei este método auxiliar para não repetir código
  private processarFinalizacao() {
    this.pararCronometro();
    this.simuladoFinalizado = true;
    this.cronometroVisivel = true;

    this.calcularResultados();
    this.salvarHistoricoEmLote();
    this.persistirTentativaNoBanco();

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  salvarHistoricoEmLote() {
    if (!this.authService.isLoggedIn()) return;

    // Prepara o array (lote) de uma só vez
    const lote: RegistrarTentativaDTO[] = this.questoesDetalhadas
      .map((questao, index) => {
        const respostaDada = this.respostasUsuario[index];
        if (!respostaDada) return null; // Pula questões em branco

        return {
          questaoId: questao.id,
          acertou: respostaDada === questao.resposta,
          topicos: questao.topicos || []
        };
      })
      .filter((item): item is RegistrarTentativaDTO => item !== null);

    // Envia tudo em uma ÚNICA requisição para o Java
    if (lote.length > 0) {
      this.historicoService.registrarTentativasEmLote(lote)
        .pipe(take(1))
        .subscribe({
          next: () => console.log(`${lote.length} questões registradas no histórico.`),
          error: (err) => console.error('Erro ao salvar histórico em lote', err)
        });
    }
  }

  calcularResultados() {
    console.log('--- INICIANDO CÁLCULO DE RESULTADOS ---');
    // Reseta contadores
    this.resultado = {
      acertos: 0,
      total: this.questoesDetalhadas.length,
      tempo: this.tempoFormatado,
      dificuldade: {
        facil: { acertos: 0, total: 0 },
        media: { acertos: 0, total: 0 },
        dificil: { acertos: 0, total: 0 }
      }
    };

    this.questoesDetalhadas.forEach((questao, index) => {
      const respostaUser = this.respostasUsuario[index];
      const acertou = respostaUser === questao.resposta; // Verifica se acertou
      
      const dif = questao.dificuldade ? questao.dificuldade.toUpperCase() : 'MEDIA';

      // Contagem Geral
      if (acertou) this.resultado.acertos++;

      // Contagem por Dificuldade
      if (dif.includes('FACIL') || dif.includes('FÁCIL')) {
        this.resultado.dificuldade.facil.total++;
        if (acertou) this.resultado.dificuldade.facil.acertos++;
      } 
      else if (dif.includes('DIFICIL') || dif.includes('DIFÍCIL')) {
        this.resultado.dificuldade.dificil.total++;
        if (acertou) this.resultado.dificuldade.dificil.acertos++;
      } 
      else {
        // Assume MÉDIA para o resto
        this.resultado.dificuldade.media.total++;
        if (acertou) this.resultado.dificuldade.media.acertos++;
      }
    });
    console.log('Resultado Final Calculado:', this.resultado);
  }
}