import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SimuladoService, Simulado } from '../../services/simulado';
import { QuestionService } from '../../../questions/services/questionService';
import { Questao } from '../../../../core/models/Question';
import Swal from 'sweetalert2';
import { QuestionCard } from '../../../questions/components/question-card/question-card';
import { MarkdownComponent } from 'ngx-markdown';
import { RemoveImageMarkdownPipe } from '../../../../shared/pipes/remove-image-markdown-pipe';
import { KatexPipe } from '../../../../shared/pipes/katex.pipe';

@Component({
  selector: 'app-simulado-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MarkdownComponent, KatexPipe, RemoveImageMarkdownPipe],
  templateUrl: './simulado-editar.html',
  styleUrl: './simulado-editar.css',
})
export class SimuladoEditar implements OnInit {
  
  route = inject(ActivatedRoute);
  router = inject(Router);
  simuladoService = inject(SimuladoService);
  questaoService = inject(QuestionService);

  simuladoId: string = '';
  
  // Dados do formulário
  form = {
    nome: '',
    descricao: ''
  };

  // Listas
  questoesDetalhadas: Questao[] = []; // Para exibir na tela
  idsQuestoes: string[] = [];         // Para enviar ao backend
  
  isLoading = true;

  ngOnInit() {
    this.simuladoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.simuladoId) {
      this.carregarDados();
    }
  }

  carregarDados() {
    this.isLoading = true;
    
    // 1. Busca o Simulado
    this.simuladoService.buscarPorId(this.simuladoId).subscribe({
      next: (simulado) => {
        // Preenche o formulário
        this.form.nome = simulado.nome;
        this.form.descricao = simulado.descricao;
        this.idsQuestoes = simulado.questoes || [];

        // 2. Se tiver questões, busca os detalhes para exibir
        if (this.idsQuestoes.length > 0) {
          this.questaoService.buscarPorIds(this.idsQuestoes).subscribe({
            next: (questoes) => {
              this.questoesDetalhadas = questoes;
              this.isLoading = false;
            },
            error: () => this.isLoading = false
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erro', 'Não foi possível carregar o simulado.', 'error');
        this.router.navigate(['/simulados']);
      }
    });
  }

  // Remove a questão da lista local (antes de salvar)
  removerQuestao(index: number) {
    Swal.fire({
      title: 'Remover questão?',
      text: 'Ela será removida deste simulado ao salvar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover'
    }).then((result) => {
      if (result.isConfirmed) {
        // 1. Pega o ID da questão que vai ser removida visualmente
        const questaoRemovida = this.questoesDetalhadas[index];

        // 2. Remove da lista visual
        this.questoesDetalhadas.splice(index, 1);

        // 3. Remove da lista de IDs usando o ID exato (filtro)
        this.idsQuestoes = this.idsQuestoes.filter(id => id !== questaoRemovida.id);
      }
    });
  }

  salvarAlteracoes() {
    if (!this.form.nome) {
      Swal.fire('Atenção', 'O simulado precisa de um nome.', 'warning');
      return;
    }

    const idsAtualizados = this.questoesDetalhadas.map(q => q.id);

    const payload = {
      nome: this.form.nome,
      descricao: this.form.descricao,
      questoes: idsAtualizados // Envia a lista atualizada (sem as excluídas)
    };

    this.simuladoService.atualizarSimulado(this.simuladoId, payload).subscribe({
      next: () => {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Simulado atualizado com sucesso.',
          icon: 'success',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.router.navigate(['/simulados']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erro', 'Falha ao atualizar simulado.', 'error');
      }
    });
  }
}