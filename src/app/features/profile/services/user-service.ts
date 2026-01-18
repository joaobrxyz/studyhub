import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Auth } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment.prod';

// Define a estrutura do usuário esperada da API
export interface Usuario {
  nome: string;
  email: string;
  quantidadeSimulados: number;
  curso: string;
  streakAtual: number
  premium: boolean;
  dataFimPremium: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;
  private http = inject(HttpClient);
  private authService = inject(Auth);

  private usuarioCache: Usuario | null = null;

  constructor() {
    // Escuta o sinal de mudança de login do Auth
    this.authService.loginStatusChanged.subscribe(() => {
      if (!this.authService.isLoggedIn()) {
        this.usuarioCache = null; 
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Busca os dados do usuário logado na API.
   * @returns Um Observable com os dados do usuário.
   */
  getUsuarioLogado(): Observable<Usuario> {
    // Se já temos o usuário no cache, retorna ele IMEDIATAMENTE sem ir ao servidor
    if (this.usuarioCache) {
      return of(this.usuarioCache);
    }

    const token = this.authService.getToken();
    if (!token) throw new Error('Token não encontrado.');

    // Se não tem no cache, busca no Java e USA O 'TAP' PARA GUARDAR
    return this.http.get<Usuario>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(user => {
        this.usuarioCache = user;
      })
    );
  }

  atualizarDadosUsuario(): Observable<Usuario> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Token não encontrado.');

    return this.http.get<Usuario>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(user => {
        this.usuarioCache = user;
      })
    );
  }

  atualizarUsuario(dados: Usuario): Observable<void> {
    // Envia o objeto usuário modificado para o backend
    return this.http.put<void>(this.apiUrl, dados, { headers: this.getHeaders() });
  }

  limparCache() {
    this.usuarioCache = null;
  }
}