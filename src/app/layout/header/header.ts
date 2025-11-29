import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true, // Se seu projeto for standalone
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  authService = inject(Auth);
  router = inject(Router);

  // Função simples de busca no header
  onSearch(event: any) {
    const termo = event.target.value;
    if (termo) {
      this.router.navigate(['/questoes'], { queryParams: { termo: termo } });
    }
  }


  irParaConfiguracoes() {
    this.router.navigate(['/perfil']);
  }

  get usuarioNome(): string {
     // Exemplo: return this.authService.getUser().name;
     return 'João Vitor'; 
  }

  irParaBusca() {
    this.router.navigate(['/questoes']);
  }
}