import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SimuladoService, Simulado } from '../../services/simulado';
import { QuestionService } from '../../../questions/services/questionService';
import { Questao } from '../../../../core/models/Question';
import { QuestionCard } from '../../../questions/components/question-card/question-card';
import Swal from 'sweetalert2';

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarDados(id);
    }
    this.iniciarCronometro();
  }

  ngOnDestroy() {
    this.pararCronometro();
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

  carregarDados(simuladoId: string) {
    this.isLoading = true;
    
    this.simuladoService.buscarPorId(simuladoId).subscribe({
      next: (simuladoRetornado) => {
        this.simulado = simuladoRetornado;

        if (this.simulado.questoes && this.simulado.questoes.length > 0) {
          this.questaoService.buscarPorIds(this.simulado.questoes).subscribe({
            next: (questoesReais) => {
              this.questoesDetalhadas = questoesReais;
              
              this.respostasUsuario = new Array(questoesReais.length).fill('');
              
              this.isLoading = false;
            },
            error: (err) => this.isLoading = false
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
             icon: 'error',
             title: 'Simulado Indisponível',
             text: 'Não encontramos este simulado.'
        }).then(() => {
             // Redireciona para a lista de simulados
             this.router.navigate(['/simulados']);
        });
      }
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

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
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