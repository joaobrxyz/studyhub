import { Component, inject, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { Auth } from '../../../core/services/auth';
import { UserService, Usuario } from '../services/user-service';
import Swal from 'sweetalert2';
import { HistoricoService } from '../../questions/services/historico-service';
import { take } from 'rxjs';

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
  historicoService = inject(HistoricoService);

  usuario: Usuario | undefined; 
  usuarioBackup: Usuario | undefined;
  isLoading: boolean = true;

  totalResolvidas: number = 0;
  taxaAcertos: number = 0;
  totalSimulados: number = 0;

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarEstatisticas();
  }

  carregarDadosUsuario() {
    this.isLoading = true;

    this.userService.getUsuarioLogado().subscribe({
      next: (dados) => {
        this.usuario = dados;
        this.totalSimulados = dados.quantidadeSimulados || 0;
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

  carregarEstatisticas() {
    this.historicoService.getTotalResolvidas()
    .pipe(take(1))
    .subscribe(total => this.totalResolvidas = total);
    
    this.historicoService.getEstatisticasGerais()
    .pipe(take(1))
    .subscribe(res => {
      if (res.totalTentativas > 0) {
        this.taxaAcertos = Math.round((res.totalAcertos / res.totalTentativas) * 100);
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