import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment.prod';

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private timerLogout: any;
  private apiUrl = `${environment.apiUrl}/auth`;
  public loginStatusChanged = new Subject<void>();
  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    
    const payload = {
      email: credentials.email,
      senha: credentials.password,
    };

    return this.http.post<any>(this.apiUrl+ '/signin', payload, { headers }).pipe(
      map((response) => {
        const token = response?.token || response?.accessToken;
        if (token) {
          this.saveToken(token);
        }
        return response;
      }),
      catchError((err) => {
        const message = err?.error?.message || 'E-mail ou senha inválidos.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  private tokenKey = 'studyhub_token';

  constructor(
    private router: Router,
    private http: HttpClient) {}

  register(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl + '/signup', payload, { headers });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loginStatusChanged.next();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 1. Agenda o logout para daqui a X milissegundos
  public autoLogout(expirationDuration: number) {
    // Limpa qualquer timer anterior para não duplicar
    if (this.timerLogout) {
      clearTimeout(this.timerLogout);
    }

    // Agenda o "Sniper" (Logout exato)
    this.timerLogout = setTimeout(() => {
      this.logout();
      
      Swal.fire({
        title: 'Sessão Expirada',
        text: 'Seu tempo de login acabou. Por segurança, entre novamente.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0d6efd'
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
      
    }, expirationDuration);
  }

  // 2. Chamado no F5 ou App.component para restaurar o timer
  public verificarEAgendarLogout(): void {
    const token = this.getToken();
    if (!token) return;

    const dataExpiracao = this.getDataExpiracaoToken(token);
    if (!dataExpiracao) return;

    const agora = new Date().getTime();
    const tempoRestante = dataExpiracao.getTime() - agora;

    if (tempoRestante > 0) {
      // Se ainda tem tempo, agenda o logout para o tempo que sobra
      console.log(`Restaurando sessão. Logout agendado para daqui a ${Math.round(tempoRestante/1000/60)} minutos.`);
      this.autoLogout(tempoRestante);
    } else {
      // Se já passou, desloga na hora
      this.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  // 3. Lê a data do token sem precisar chamar o backend
  private getDataExpiracaoToken(token: string): Date | null {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      
      if (!payload.exp) return null;

      // O 'exp' vem em segundos, convertemos para milissegundos
      return new Date(payload.exp * 1000); 
    } catch (e) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('usuario');
    // Cancela o timer se o usuário sair por vontade própria para não estourar erro depois
     if (this.timerLogout) {
       clearTimeout(this.timerLogout);
       this.timerLogout = null;
     }
    this.loginStatusChanged.next();
  }

  getUserRole(): string {
    return 'USER';
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { responseType: 'text' as 'json' });
  }

  resetPassword(payload: ResetPasswordPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, payload, { responseType: 'text' as 'json' });
  }
}
