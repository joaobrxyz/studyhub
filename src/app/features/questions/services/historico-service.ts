import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../../../core/services/auth'; 
import { environment } from '../../../../environments/environment.prod';

export interface RegistrarTentativaDTO {
  questaoId: string;
  acertou: boolean;
  topicos: string[];
}

export interface EstatisticasGerais {
  totalTentativas: number;
  totalAcertos: number;
}

export interface DesempenhoMateria {
  materia: string;
  acertos: number;
  erros: number;
}

export interface VolumeEstudo {
  data: string; // Formato YYYY-MM-DD vindo do LocalDate
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private readonly API = `${environment.apiUrl}/historico-questoes`;
  private http = inject(HttpClient);
  private authService = inject(Auth);

  getTotalResolvidas(): Observable<number> {
    return this.http.get<number>(`${this.API}/total`, {
      headers: this.getHeaders()
    });
  }

  registrarTentativa(dados: RegistrarTentativaDTO): Observable<void> {
    return this.http.post<void>(`${this.API}/registrar`, dados, { 
      headers: this.getHeaders() 
    });
  }

  getEstatisticasGerais(): Observable<EstatisticasGerais> {
  return this.http.get<EstatisticasGerais>(`${this.API}/estatisticas/gerais`, {
    headers: this.getHeaders()
  });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token não encontrado. Usuário precisa estar logado.');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getEvolucaoSemanal(): Observable<VolumeEstudo[]> {
    return this.http.get<VolumeEstudo[]>(`${this.API}/estatisticas/evolucao-semanal`, { headers: this.getHeaders() });
  }

  getDesempenhoMateria(): Observable<DesempenhoMateria[]> {
    return this.http.get<DesempenhoMateria[]>(`${this.API}/estatisticas/desempenho-materia`, {
      headers: this.getHeaders() 
    });
  }

  registrarTentativasEmLote(dados: RegistrarTentativaDTO[]): Observable<void> {
    return this.http.post<void>(`${this.API}/registrar-lote`, dados, { 
      headers: this.getHeaders() 
    });
  }
}