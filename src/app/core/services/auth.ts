import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  public loginStatusChanged = new Subject<void>();
  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    
    const payload = {
      email: credentials.email,
      senha: credentials.password,
    };

    return this.http.post<any>('http://localhost:8080/auth/signin', payload, { headers }).pipe(
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

  constructor(private router: Router, private http: HttpClient) {}
  register(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post('http://localhost:8080/auth/signup', payload, { headers });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loginStatusChanged.next();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('usuario');
    this.loginStatusChanged.next();
  }

  getUserRole(): string {
    return 'USER';
  }
}
