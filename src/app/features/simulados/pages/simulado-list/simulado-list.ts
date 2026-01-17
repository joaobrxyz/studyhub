import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SimuladoService, Simulado } from '../../services/simulado';
import { UserService } from '../../../profile/services/user-service';
import Swal from 'sweetalert2';
import { ViewportScroller } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-simulado-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './simulado-list.html',
  styleUrls: ['./simulado-list.css']
})
export class SimuladoList implements OnInit {
  
  private router = inject(Router);
  private simuladoService = inject(SimuladoService);
  private scroller = inject(ViewportScroller);
  private userService = inject(UserService);

  // A tipagem aqui garante que o HTML reconheça o campo 'nome' e 'questoes'
  simulados: Simulado[] = []; 
  simuladosFiltrados: Simulado[] = [];
  isLoading: boolean = true;
  isPremium: boolean = false;

  ngOnInit() {
    this.scroller.scrollToPosition([0, 0]);
    this.userService.getUsuarioLogado()
      .pipe(take(1))
      .subscribe(user => {
        this.isPremium = user?.premium || false;
    });
    this.buscarSimulados();
  }

  readonly labelsDificuldade: Record<string, string> = {
  'FACIL': 'Fácil',
  'MEDIO': 'Médio',
  'DIFICIL': 'Difícil'
  };

  acessarDesempenho(simuladoId: string) {
  if (this.isPremium) {
    // Se for PRO, navega normalmente
    this.router.navigate(['/simulados/desempenho', simuladoId]);
  } else {
    // Se for Free, abre o convite
    this.abrirModalAssinatura();
  }
}

abrirModalAssinatura() {
  Swal.fire({
    title: 'Recurso Premium',
    text: 'A análise detalhada de desempenho e estatísticas por simulado são exclusivas para membros do StudyHub premium.',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Conhecer StudyHub premium',
    cancelButtonText: 'Agora não',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#6c757d',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/premium']);
    }
  });
}

  buscarSimulados() {
    this.isLoading = true;
    this.simuladoService.listarSimulados()
    .pipe(take(1))
    .subscribe({
      next: (dados) => {
        this.simulados = dados;
        this.simuladosFiltrados = [...this.simulados];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar simulados', err);
        this.isLoading = false;
      }
    });
  }

  // Lógica de busca em tempo real
  onSearch(event: any) {
    const termo = event.target.value.toLowerCase();
    this.simuladosFiltrados = this.simulados.filter(s => 
      s.nome.toLowerCase().includes(termo)
    );
  }

  abrirSimulado(simulado: Simulado) {
    // Se não tiver questões, barra a entrada e sugere o Portal
    if (simulado.quantidadeQuestoes === 0) {
      
      Swal.fire({
        title: 'Simulado Vazio',
        text: 'Este simulado não possui questões. Deseja ir ao Portal de Questões para adicionar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ir para Questões', // Texto atualizado
        cancelButtonText: 'Fechar'
      }).then((result) => {
        if (result.isConfirmed) {
          // MUDANÇA AQUI: Redireciona para o portal geral de questões
          this.router.navigate(['/questoes']);
        }
      });
      return; 
    }

    this.router.navigate(['/simulados/', simulado.id]);
  }

  excluirSimulado(id: string, event: Event) {
    event.stopPropagation(); 

    // 1. Substitui o 'confirm()' por um Swal customizado
    Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter essa exclusão!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Vermelho para indicar perigo
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      
      // Se o usuário clicou em "Sim, excluir!"
      if (result.isConfirmed) {
        
        this.simuladoService.deletarSimulado(id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            // Remove da lista visualmente
            this.simulados = this.simulados.filter(s => s.id !== id);
            this.simuladosFiltrados = this.simuladosFiltrados.filter(s => s.id !== id);
            
            Swal.fire(
              'Excluído!',
              'O simulado foi removido com sucesso.',
              'success'
            );
          },
          error: (err) => {
            console.error(err);
            
            Swal.fire(
              'Erro',
              'Não foi possível excluir o simulado.',
              'error'
            );
          }
        });
      }
    });
  }
}