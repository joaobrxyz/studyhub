import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { Questao } from '../../../../core/models/Question';
import { RemoveImageMarkdownPipe } from '../../../../shared/pipes/remove-image-markdown-pipe';
import { KatexPipe } from '../../../../shared/pipes/katex.pipe';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent, KatexPipe, RemoveImageMarkdownPipe],
  templateUrl: './question-card.html',
  styleUrls: ['./question-card.css']
})
export class QuestionCard implements OnChanges {

  @Input() questao!: Questao;
  @Input() mostrarResultado = false; 
  @Input() ehCorreto = false;        
  @Input() bloquearInteracao = false;

  // Controle se o botão aparece ou não (Padrão false para o simulado)
  @Input() exibirBotaoResponder = false;
  
  // Input para receber a seleção vinda do pai (útil se o usuário voltar para a questão)
  @Input() alternativaSelecionada: string | null = null;


  // Avisa o pai qual alternativa foi clicada
  @Output() mudouOpcao = new EventEmitter<string>(); 

  // Evento para quando clicar no botão de dentro do card
  @Output() acaoResponder = new EventEmitter<void>();

  alternativasFormatadas: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questao'] && this.questao) {
      this.formatarAlternativas();
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
    this.alternativaSelecionada = valor;
    this.mudouOpcao.emit(valor);
  }

  // Função interna que avisa o pai que o botão foi clicado
  clicouResponder() {
    this.acaoResponder.emit();
  }
}