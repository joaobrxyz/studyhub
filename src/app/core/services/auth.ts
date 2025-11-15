import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root' // Isso torna o serviço acessível em todo o app
})
export class Auth {

  private tokenKey = 'studyhub_token'; // A chave onde salvaremos o token

  constructor(private router: Router) { }

  // 1. Salva o token (chamado após o login ter sucesso)
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // 2. Pega o token (usado pelo Interceptor para enviar na API)
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 3. Verifica se está logado (simples verificação se tem token)
  isLoggedIn(): boolean {
    const token = this.getToken();
    // Aqui futuramente podemos verificar se o token expirou
    return !!token; // Retorna true se token existir, false se não
  }

  // 4. Faz Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/auth/login']);
  }
  
  // 5. (Opcional) Verifica se é ADMIN (se você implementar roles depois)
  getUserRole(): string {
    // Futuramente você decodifica o JWT aqui para ler o 'role'
    return 'USER'; 
  }
}