import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimuladoService, Simulado } from '../../services/simulado';
import Swal from 'sweetalert2';
import { take } from 'rxjs';

@Component({
  selector: 'app-simulado-add-question-modal', // Nome semântico
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simulado-add-question-modal.html',
  styleUrl: './simulado-add-question-modal.css'
})
export class SimuladoAddQuestionModal implements OnInit {
  private simuladoService = inject(SimuladoService);

  @Input() questaoId!: string; 
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<Simulado>();
  @Output() openCreate = new EventEmitter<void>(); 

  simuladosUsuario: Simulado[] = [];
  simuladosFiltrados: Simulado[] = [];
  filtroSimulado: string = '';

  ngOnInit(): void {
    this.carregarSimulados();
  }

  carregarSimulados() {
    this.simuladoService.listarSimulados()
    .pipe(take(1))
    .subscribe({
      next: (dados) => {
        this.simuladosUsuario = dados;
        this.simuladosFiltrados = [...this.simuladosUsuario];
      }
    });
  }

  filtrarSimulados() {
    const termo = this.filtroSimulado.toLowerCase();
    this.simuladosFiltrados = this.simuladosUsuario.filter(sim => 
      sim.nome.toLowerCase().includes(termo)
    );
  }

  fechar() { this.close.emit(); }

  selecionarSimulado(simulado: Simulado) {
    if (simulado.quantidadeQuestoes >= 100) {
    Swal.fire({
      title: 'Limite Atingido',
      text: 'Este simulado já atingiu o limite máximo de 100 questões.',
      icon: 'warning',
      confirmButtonColor: '#2563eb'
    });
    return; // Interrompe a execução aqui mesmo
  }

    this.simuladoService.adicionarQuestaoAoSimulado(simulado.id, this.questaoId)
    .pipe(take(1))
    .subscribe({
      next: () => {
        // Sucesso!
        Swal.fire({
          title: 'Adicionado!',
          text: 'Questão salva com sucesso no simulado.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.confirm.emit(simulado);
        this.fechar();
      },
      error: (err) => {
        // 2. AQUI você recebe o 409 do Java
        if (err.status === 409) {
          Swal.fire({
            title: 'Aviso',
            text: 'Essa questão já faz parte deste simulado.',
            icon: 'info',
            confirmButtonColor: '#2563eb'
          });
        } else {
          // Outros erros (500, 404, etc)
          Swal.fire('Erro', 'Não foi possível adicionar a questão.', 'error');
        }
      }
    });
  }

  dispararCriacaoNova() {
    this.openCreate.emit();
  }
}