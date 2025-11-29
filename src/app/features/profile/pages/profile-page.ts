import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
  standalone: true
})
export class ProfilePage {
  authService = inject(Auth);
  router = inject(Router);

  usuario = {
    nome: 'Usuário Exemplo',
    email: 'usuario@email.com',
    curso: 'Análise e Desenvolvimento de Sistemas'
  };

  editarPerfil() {
    console.log('Editar perfil...');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
