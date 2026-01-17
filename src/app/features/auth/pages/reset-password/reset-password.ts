import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {

  token: string | null = null;
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;
  loading: boolean = false;
  resetSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute, // Para ler o token da URL
    private authService: Auth,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.errorMessage = 'Token de redefinição não encontrado na URL.';
    }
  }

  onSubmit(): void {
    if (!this.token) {
      this.errorMessage = 'Token ausente. Não é possível redefinir a senha.';
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    
    // Adicionar validação de tamanho e complexidade da senha aqui!
    if (this.newPassword.length < 8) {
      this.errorMessage = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: (response) => {
        this.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'Senha Redefinida!',
          text: 'Sua senha foi alterada com sucesso. Faça login com a nova senha.',
          confirmButtonText: 'Ir para o Login'
        }).then(() => {
          // Redireciona APÓS o usuário fechar o modal
          this.router.navigate(['/auth/login']); 
        });
      },
      error: (err) => {
        this.loading = false;
        
        const backendMessage = err.error?.message || 'Link inválido ou expirado. Solicite um novo.';
        this.errorMessage = backendMessage; // Mantém a mensagem no HTML

        Swal.fire({
          icon: 'error',
          title: 'Falha na Redefinição',
          text: backendMessage,
          
          showDenyButton: true, 
          denyButtonText: 'Solicitar Novo Link',
          denyButtonColor: '#28a745',
          
          confirmButtonText: 'Fechar', 
          focusDeny: true, 
          
        }).then((result) => {
          if (result.isDenied) {
             this.router.navigate(['/auth/forgot-password']); 
          }
        });
      }
    });
  }
}