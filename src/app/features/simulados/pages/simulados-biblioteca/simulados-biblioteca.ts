import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SimuladoService } from '../../services/simulado';
import { Simulado } from '../../services/simulado';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { take } from 'rxjs';

@Component({
  selector: 'app-simulados-biblioteca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './simulados-biblioteca.html',
  styleUrls: ['./simulados-biblioteca.css']
})
export class SimuladosBiblioteca implements OnInit {
  private simuladoService = inject(SimuladoService);
  private router = inject(Router);

  // Lista vinda da vitrine pública
  simuladosPublicos: Simulado[] = [];
  
  // Lista de nomes para controlar o estado do botão "Já adicionado"
  meusSimuladosIdentificadores: string[] = [];
  
  termoBusca: string = '';
  isLoading = true;

  readonly labelsDificuldade: Record<string, string> = {
  'FACIL': 'Fácil',
  'MEDIO': 'Médio',
  'DIFICIL': 'Difícil'
  };

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.carregarDados();
  }

  carregarDados() {
    this.isLoading = true;
    
    // 1. Busca os simulados oficiais (públicos)
    this.simuladoService.listarPublicos()
    .pipe(take(1))
    .subscribe({
      next: (publicos) => {
        this.simuladosPublicos = publicos;
        
        // 2. Busca simulados do usuário para marcar o que ele já possui
        this.simuladoService.listarSimulados()
        .pipe(take(1))
        .subscribe({
          next: (meus) => {
            this.meusSimuladosIdentificadores = meus.map(s => 
              `${s.nome}|${s.descricao || ''}`
            );
            this.isLoading = false;
          },
          error: () => this.isLoading = false
        });
      },
      error: () => this.isLoading = false
    });
  }

  jaEstaAdicionado(simulado: Simulado): boolean {
    const id = `${simulado.nome}|${simulado.descricao || ''}`;
    return this.meusSimuladosIdentificadores.includes(id);
  }

  // Lógica de filtro para a barra de pesquisa centralizada
  get simuladosFiltrados() {
    if (!this.termoBusca.trim()) return this.simuladosPublicos;
    
    const termo = this.termoBusca.toLowerCase();
    return this.simuladosPublicos.filter(s => 
      s.nome.toLowerCase().includes(termo) || 
      (s.descricao && s.descricao.toLowerCase().includes(termo))
    );
  }

  /**
   * Puxa nome, descrição e questões do simulado público e 
   * utiliza o método 'criar' padrão para salvar no perfil do usuário.
   */
  adicionarSimulado(simulado: Simulado) {
    // Monta o objeto apenas com os campos que o seu criar() espera
    const novoSimuladoParaUsuario = {
      nome: simulado.nome,
      descricao: simulado.descricao,
      questoes: simulado.questoes
    };

    // Reutiliza o método criar simulado padrão do seu service
    this.simuladoService.criarSimulado(novoSimuladoParaUsuario)
    .pipe(take(1))
    .subscribe({
      next: () => {
        // Atualiza a lista local para desabilitar o botão imediatamente
        const identificadorCompleto = `${simulado.nome}|${simulado.descricao || ''}`;
        this.meusSimuladosIdentificadores.push(identificadorCompleto);
        
        // Popup interativo com opções
        Swal.fire({
          title: 'Adicionado com sucesso!',
          text: `"${simulado.nome}" agora faz parte da sua lista. O que deseja fazer?`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#2563eb', 
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Ir para Meus Simulados',
          cancelButtonText: 'Continuar explorando',
          reverseButtons: true 
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/simulados']); 
          }
        });
      },
      error: (err) => {
        console.error('Erro ao adicionar simulado:', err);
        Swal.fire('Erro', 'Não foi possível adicionar este simulado.', 'error');
      }
    });
  }
}