import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MarkdownComponent } from 'ngx-markdown';
import { Questao } from '../../../../core/models/Question';
import { RemoveImageMarkdownPipe } from '../../../../shared/pipes/remove-image-markdown-pipe';
import { KatexPipe } from '../../../../shared/pipes/katex.pipe';
import { HistoricoService } from '../../services/historico-service';
import { Auth } from '../../../../core/services/auth';
import { take } from 'rxjs';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent, KatexPipe, RemoveImageMarkdownPipe],
  templateUrl: './question-card.html',
  styleUrls: ['./question-card.css']
})
export class QuestionCard implements OnChanges {
  private sanitizer = inject(DomSanitizer);
  private historicoService = inject(HistoricoService);
  private authService = inject(Auth);

  @Input() questao!: Questao;
  @Input() mostrarResultado = false; 
  @Input() ehCorreto = false;        
  @Input() bloquearInteracao = false;
  @Input() idUnico: string = 'questao-padrao';

  // Controle se o botão aparece ou não (Padrão false para o simulado)
  @Input() exibirBotaoResponder = false;
  
  // Input para receber a seleção vinda do pai (útil se o usuário voltar para a questão)
  @Input() alternativaSelecionada: string | null = null;


  // Avisa o pai qual alternativa foi clicada
  @Output() mudouOpcao = new EventEmitter<string>(); 

  // Evento para quando clicar no botão de dentro do card
  @Output() acaoResponder = new EventEmitter<void>();

  alternativasFormatadas: any[] = [];

  exibirResolucao = false;
  videoUrl: SafeResourceUrl | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questao'] && this.questao) {
      this.exibirResolucao = false;
      this.formatarAlternativas();
      this.atualizarVideoUrl();
    }
  }

  // Método para alternar a visualização da resolução
  alternarResolucao() {
    this.exibirResolucao = !this.exibirResolucao;
  }

  // Método para sanitizar a URL do YouTube
  private atualizarVideoUrl() {
    // Verifique o nome aqui também:
    if (this.questao.resolucaoVideoId) {
      const url = `https://www.youtube.com/embed/${this.questao.resolucaoVideoId}`;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.videoUrl = null;
    }
  }

  private formatarAlternativas() {
    this.alternativasFormatadas = this.questao.alternativas.map(alt => {
      const parts = alt.split(') ');
      return {
        letra: parts[0],
        texto: parts.slice(1).join(') ')
      };
    });
  }

  // Método chamado pelo (change) do HTML
  selecionarAlternativa(valor: string) {
    if (this.bloquearInteracao) return;
    this.alternativaSelecionada = valor;
    this.mudouOpcao.emit(valor);
  }

  // Função interna que avisa o pai que o botão foi clicado
  clicouResponder() {
    this.acaoResponder.emit();
    if (this.authService.isLoggedIn()) { 
        const acertou = this.alternativaSelecionada === this.questao.resposta;

        this.historicoService.registrarTentativa({
            questaoId: this.questao.id,
            acertou: acertou,
            topicos: this.questao.topicos || [] 
        })
        .pipe(take(1))
        .subscribe({
            next: () => console.log('✅ Histórico salvo!'),
            error: (err) => console.error('❌ Erro ao salvar:', err)
        });

    } else {
        console.log('⚠️ Visitante: Resultado exibido, mas não salvo.');
    }
  }
}