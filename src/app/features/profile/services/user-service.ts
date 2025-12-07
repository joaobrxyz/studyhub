import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../../../core/services/auth';

// Define a estrutura do usuário esperada da API
export interface Usuario {
  nome: string;
  email: string;
  curso: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/user';
  private http = inject(HttpClient);
  private authService = inject(Auth);

  /**
   * Busca os dados do usuário logado na API.
   * @returns Um Observable com os dados do usuário.
   */
  getUsuarioLogado(): Observable<Usuario> {
    const token = this.authService.getToken();
    
    if (!token) {
      throw new Error('Token não encontrado no cache.');
    }

    // Configura o cabeçalho Authorization com o token Bearer
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Realiza a requisição GET para a API
    return this.http.get<Usuario>(this.apiUrl, { headers });
  }

  atualizarUsuario(dados: Usuario): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Envia o objeto usuário modificado para o backend
    return this.http.put<void>(this.apiUrl, dados, { headers });
  }
}