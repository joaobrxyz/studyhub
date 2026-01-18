import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { take } from 'rxjs';
import { Auth } from '../../../../core/services/auth';
import { UserService, Usuario } from '../../../profile/services/user-service';
import { ActivatedRoute } from '@angular/router'; 
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment.prod';

declare var MercadoPago: any;

@Component({
  selector: 'app-premium-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-plan.html',
  styleUrl: './premium-plan.css'
})
export class PremiumPlan implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  isLoading = false;
  usuario: Usuario | undefined;

  ngOnInit(): void {
    // Garante que a página abra no topo
    window.scrollTo(0, 0);
    this.carregarStatusUsuario();
    this.verificarRetornoPagamento();
  }

  carregarStatusUsuario() {
    this.userService.getUsuarioLogado().pipe(take(1)).subscribe({
      next: (dados) => this.usuario = dados
    });
  }

  verificarRetornoPagamento() {
    // Captura os parâmetros ?status=... e ?payment_id=...
    const status = this.route.snapshot.queryParamMap.get('status');
    
    if (status === 'approved') {
      this.userService.atualizarDadosUsuario().subscribe(() => {
        Swal.fire('Sucesso!', 'Seu StudyHub PRO está ativo!', 'success');
      });
    } else if (status === 'rejected' || status === 'null') {
      Swal.fire('Erro', 'O pagamento não foi aprovado. Tente novamente.', 'error');
    } else if (status === 'in_process') {
      Swal.fire('Pendente', 'Estamos processando seu pagamento.', 'info');
    }
  }

  iniciarAssinatura() {
    this.isLoading = true;

    // Pega o token que você salvou no login
    const token = this.authService.getToken();

    // Cria os Headers com o padrão Bearer
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Envia os headers na requisição
    this.http.post(`${environment.apiUrl}/api/pagamentos/assinar`, {}, { 
        headers, 
        responseType: 'text' 
      })
      .pipe(take(1))
      .subscribe({
        next: (urlCheckout) => {
          // Redireciona para o checkout do Mercado Pago
          window.location.href = urlCheckout;
        },
        error: (err) => {
          console.error('Erro ao gerar assinatura do StudyHub', err);
          this.isLoading = false;
          
          if (err.status === 500) {
            alert('Erro no servidor. Verifique se o token de login ainda é válido.');
          } else {
            alert('Não foi possível iniciar a assinatura. Tente novamente.');
          }
        }
      });
  }
}