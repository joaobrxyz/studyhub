import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../../../core/services/auth';

export interface Simulado {
  id: string;
  nome: string;      
  descricao: string;
  data: string;
  idUser: string;
  questoes: string[]; // É um array de strings (IDs das questões)
}

@Injectable({
  providedIn: 'root'
})
export class SimuladoService {
  private apiUrl = 'http://localhost:8080/simulados'; 
  private http = inject(HttpClient);
  private authService = inject(Auth);

  listarSimulados(): Observable<Simulado[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Simulado[]>(this.apiUrl, { headers });
  }

  deletarSimulado(id: string): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  buscarPorId(id: string): Observable<Simulado> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<Simulado>(`${this.apiUrl}/${id}`, { headers });
  }

  gerarSimulado(dados: any): Observable<Simulado> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<Simulado>(`${this.apiUrl}/gerar`, dados, { headers });
  }

  atualizarSimulado(id: string, dados: any): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<void>(`${this.apiUrl}/${id}`, dados, { headers });
  }
}