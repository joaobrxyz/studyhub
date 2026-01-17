import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})

export class ForgotPassword {

  email: string = '';
  loading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private authService: Auth, 
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor, insira seu e-mail.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Link Enviado!',
          html: `Verifique sua caixa de entrada no <b>${this.email}</b> e sua pasta de spam. O link expira em 60 minutos.`,
          confirmButtonText: 'Entendi'
        }).then(() => {
            this.router.navigate(['/auth/login']); 
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Ocorreu um erro ao processar sua solicitação.';
        console.error('Erro no Back-end:', err);
      }
    });
  }
}
