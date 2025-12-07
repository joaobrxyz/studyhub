import { Component, inject, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { Auth } from '../../../core/services/auth';
import { UserService, Usuario } from '../services/user-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule] 
})
export class ProfilePage implements OnInit {
  authService = inject(Auth);
  router = inject(Router);
  userService = inject(UserService); 

  usuario: Usuario | undefined; 
  usuarioBackup: Usuario | undefined;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  carregarDadosUsuario() {
    this.isLoading = true;

    this.userService.getUsuarioLogado().subscribe({
      next: (dados) => {
        this.usuario = dados;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar dados do usuário:', err);
        this.isLoading = false;
        if (err.status !== 401) {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao carregar',
                text: 'Não foi possível carregar seus dados. Tente recarregar a página.'
            });
          }
      }
    });
  }


  salvarPerfil() {
    if (!this.usuario) return;
    this.isLoading = true;

    this.userService.atualizarUsuario(this.usuario).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Sucesso!',
          text: 'Seus dados foram atualizados.',
          icon: 'success',
          timer: 2000, // Fecha sozinho em 2 segundos
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}