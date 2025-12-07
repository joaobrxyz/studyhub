import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { UserService } from '../../features/profile/services/user-service';
import { Subscription } from 'rxjs';

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
  userService = inject(UserService);

  primeiroNome: string = '';
  private loginSubscription!: Subscription;

  ngOnInit() {
    // Só busca o nome se o usuário estiver logado
    if (this.authService.isLoggedIn()) {
      this.carregarNomeUsuario();
    }
    this.loginSubscription = this.authService.loginStatusChanged.subscribe(() => {
      
      if (this.authService.isLoggedIn()) {
        // Se acabou de logar, busca o nome
        this.carregarNomeUsuario();
      } else {
        // Se acabou de deslogar, limpa o nome
        this.primeiroNome = '';
      }
      
    });
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  carregarNomeUsuario() {
    this.userService.getUsuarioLogado().subscribe({
      next: (usuario) => {
        if (usuario && usuario.nome) {
          this.primeiroNome = usuario.nome.split(' ')[0];
        }
      },
      error: (err) => {
        console.error('Erro ao carregar nome no header', err);
      }
    });
  }

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