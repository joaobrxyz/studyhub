import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../../core/services/auth'; // Ajuste o caminho se necessário
import { UserService, Usuario } from '../../../features/profile/services/user-service';
import { take } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class Sidebar implements OnInit {
  // Injeção de dependências
  private authService = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);

  // Propriedades de estado
  usuario: Usuario | undefined;
  isCollapsed = false;

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  /**
   * Busca os dados do usuário logado para exibir no rodapé da sidebar
   */
  carregarDadosUsuario() {
    this.userService.getUsuarioLogado()
    .pipe(take(1))
    .subscribe({
      next: (dados) => {
        this.usuario = dados;
      },
      error: (err) => {
        console.error('Erro ao buscar dados do usuário na sidebar:', err);
      }
    });
  }

  /**
   * Alterna entre o estado expandido e colapsado
   */
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Verifica se a rota atual é a mesma do link para aplicar a classe 'active'
   * @param route Caminho da rota para comparar
   */
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  /**
   * Executa o logout e redireciona para a tela de login
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}