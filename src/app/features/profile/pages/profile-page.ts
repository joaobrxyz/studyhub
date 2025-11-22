import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
  standalone: true
})
export class ProfilePage {

  usuario = {
    nome: 'Usuário Exemplo',
    email: 'usuario@email.com',
    curso: 'Análise e Desenvolvimento de Sistemas'
  };

  editarPerfil() {
    console.log('Editar perfil...');
  }

  logout() {
    console.log('Logout...');
  }
}
