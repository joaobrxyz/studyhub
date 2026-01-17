import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SimuladoService } from '../../services/simulado';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-simulado-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './simulado-create-modal.html',
  styleUrl: './simulado-create-modal.css'
})
export class SimuladoCreateModal {
  private fb = inject(FormBuilder);
  private simuladoService = inject(SimuladoService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ nome: string; descricao: string }>()

  simuladoForm: FormGroup;
  criadoComSucesso = false; // Controla qual tela exibir
  idSimuladoCriado?: number;

  constructor() {
    this.simuladoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['']
    });
  }

  fechar() {
    this.close.emit();
  }

  confirmarCriacao() {
    if (this.simuladoForm.valid) {
      const formVal = this.simuladoForm.value;
      
      const payload = {
        nome: formVal.titulo,
        descricao: formVal.descricao,
      };

      this.simuladoService.criarSimulado(payload)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.idSimuladoCriado = res.id;
          this.criadoComSucesso = true; 
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao criar simulado.');
        }
      });
    }
  }

  irParaQuestoes() {
    this.fechar();
    this.router.navigate(['/questoes']); 
  }

  irParaMeusSimulados() {
    this.fechar();
    this.router.navigate(['/simulados']); 
  }
}