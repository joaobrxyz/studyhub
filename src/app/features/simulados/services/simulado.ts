import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment.prod';

export interface Simulado {
  id: string;
  nome: string;      
  descricao: string;
  data: string;
  quantidadeQuestoes: number;
  questoes?: string[]; 
  dificuldade: string;
}

export enum Dificuldade {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL'
}

// Interface para o detalhamento de cada questão respondida
export interface RespostaDetalhe {
  questaoId: string;
  alternativaMarcada: string;
  correta: boolean;
  tempoGastoSegundos: number;
}

// Interface principal da Tentativa
export interface TentativaSimulado {
  id?: string; // Opcional porque ao criar ainda não tem ID
  usuarioId: string;
  simuladoId: string;
  nomeSimulado: string;
  dataFim: Date | string; // O ISO String que o Java manda
  tempoTotalSegundos: number;
  totalAcertos: number;
  totalQuestoes: number;
  porcentagemAcerto: number;
  dificuldadeSimulado: Dificuldade;
  
  // Campos para a lógica de "Refazer Erros"
  idTentativaOriginal?: string; 
  apenasErros: boolean; 
  
  detalhesRespostas: RespostaDetalhe[];
}

@Injectable({
  providedIn: 'root'
})
export class SimuladoService {
  private apiUrl = `${environment.apiUrl}/simulados`; 
  private http = inject(HttpClient);
  private authService = inject(Auth);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarSimulados(): Observable<Simulado[]> {
    return this.http.get<Simulado[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  deletarSimulado(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  buscarPorId(id: string): Observable<Simulado> {
  return this.http.get<Simulado>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  criarSimulado(dados: any): Observable<Simulado> {
    return this.http.post<Simulado>(`${this.apiUrl}`, dados, { headers: this.getHeaders() });
  }

  gerarSimulado(dados: any): Observable<Simulado> {
    return this.http.post<Simulado>(`${this.apiUrl}/gerar`, dados, { headers: this.getHeaders() });
  }

  atualizarSimulado(id: string, dados: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dados, { headers: this.getHeaders() });
  }

  // Busca os simulados da vitrine (públicos)
  listarPublicos(): Observable<Simulado[]> {
    return this.http.get<Simulado[]>(`${this.apiUrl}/publicos`, { headers: this.getHeaders() });
  }

  salvarTentativa(simuladoId: string, tentativa: TentativaSimulado): Observable<TentativaSimulado> {
    return this.http.post<TentativaSimulado>(`${this.apiUrl}/desempenho/${simuladoId}`, tentativa, { headers: this.getHeaders() });
  }

  listarHistoricoPorSimulado(simuladoId: string): Observable<TentativaSimulado[]> {
    return this.http.get<TentativaSimulado[]>(`${this.apiUrl}/desempenho/${simuladoId}`, { headers: this.getHeaders() });
  }

  buscarReforco(simuladoId: string, tentativaId: string): Observable<Simulado> {
    return this.http.get<Simulado>(`${this.apiUrl}/${simuladoId}/refazer-erros/${tentativaId}`, { headers: this.getHeaders() });
  }

  buscarTentativaPorId(tentativaId: string): Observable<TentativaSimulado> {
    return this.http.get<TentativaSimulado>(`${this.apiUrl}/tentativa/${tentativaId}`, { headers: this.getHeaders() });
  }

  adicionarQuestaoAoSimulado(simuladoId: string, questaoId: string): Observable<void> {
    // O endpoint deve bater exatamente com o @PatchMapping do seu Java
    const url = `${this.apiUrl}/${simuladoId}/adicionar-questao/${questaoId}`;
    
    // Enviamos um corpo vazio ({}), pois os dados necessários estão na URL
    return this.http.patch<void>(url, {}, { headers: this.getHeaders() });
  }
}