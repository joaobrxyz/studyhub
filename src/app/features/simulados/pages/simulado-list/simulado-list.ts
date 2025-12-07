import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SimuladoService, Simulado } from '../../services/simulado';
import Swal from 'sweetalert2';

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

  // A tipagem aqui garante que o HTML reconheça o campo 'nome' e 'questoes'
  simulados: Simulado[] = []; 
  isLoading: boolean = true;

  ngOnInit() {
    this.buscarSimulados();
  }

  buscarSimulados() {
    this.isLoading = true;
    this.simuladoService.listarSimulados().subscribe({
      next: (dados) => {
        // Ordena a lista: Data do B (Mais novo) - Data do A (Mais antigo)
        this.simulados = dados.sort((a, b) => {
          // Garante que estamos comparando datas válidas
          const dateA = new Date(a.data).getTime();
          const dateB = new Date(b.data).getTime();
          return dateB - dateA;
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar simulados', err);
        this.isLoading = false;
      }
    });
  }

  abrirSimulado(simulado: Simulado) {
    // Se não tiver questões, barra a entrada e sugere o Portal
    if (!simulado.questoes || simulado.questoes.length === 0) {
      
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
        
        this.simuladoService.deletarSimulado(id).subscribe({
          next: () => {
            // Remove da lista visualmente
            this.simulados = this.simulados.filter(s => s.id !== id);
            
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