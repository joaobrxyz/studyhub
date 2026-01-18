import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpUrlEncodingCodec, HttpHeaders } from '@angular/common/http'; // 1. Importe o Codec
import { Observable } from 'rxjs';
import { PageableResponse, Questao } from '../../../core/models/Question'; 
import { Auth } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment.prod';

const API_URL = `${environment.apiUrl}/questoes`; 

class CustomHttpUrlEncodingCodec extends HttpUrlEncodingCodec {
  override encodeKey(k: string): string {
    return super.encodeKey(k);
  }
  override encodeValue(v: string): string {
    // Pega o encode padrão (que faz Física -> F%C3%ADsica)
    // Mas "libera" o '&' (que viraria %26)
    return super.encodeValue(v).replace(/%26/g, '&');
  }
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private http = inject(HttpClient);
  private authService = inject(Auth);

  public cachedFilters: any = null;
  public cachedPage: number = 0;
  public cachedScroll: number = 0;
  public lastResponse: PageableResponse<Questao> | null = null;

  getQuestoes(filtros: any): Observable<PageableResponse<Questao>> {
    
    let params = new HttpParams()
      .set('page', filtros.page.toString())
      .set('size', filtros.size.toString());

    if (filtros.termo) {
      params = params.set('termo', filtros.termo);
    }
    

    if (filtros.disciplinas && filtros.disciplinas.length > 0) {
      filtros.disciplinas.forEach((disciplina: string) => {
        params = params.append('disciplina', disciplina); 
      });
    }

    if (filtros.instituicoes && filtros.instituicoes.length > 0) {
      filtros.instituicoes.forEach((instituicao: string) => {
        params = params.append('instituicao', instituicao); 
      });
    }

    if (filtros.anos && filtros.anos.length > 0) {
      filtros.anos.forEach((ano: string) => {
        params = params.append('ano', ano); 
      });
    }

    if (filtros.apenasErros) params = params.set('apenasErros', 'true');
    if (filtros.comResolucao) params = params.set('comResolucao', 'true');
    if (filtros.comVideo) params = params.set('comVideo', 'true');

    // Adiciona o loop para o array 'dificuldades'
    if (filtros.dificuldades && filtros.dificuldades.length > 0) {
      filtros.dificuldades.forEach((dificuldade: string) => {
        params = params.append('dificuldade', dificuldade); // Chave singular
      });
    }

    const token = this.authService.getToken();
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    if (token) {
      // Se tiver logado, adiciona o Authorization
      headers = headers.set('Authorization', `Bearer ${token}`);
    } 

    return this.http.get<PageableResponse<Questao>>(API_URL, { params: params,  headers });
  }

  getQuestaoById(id: string): Observable<Questao> {
    return this.http.get<Questao>(`${API_URL}/${id}`);
  }

  buscarPorIds(ids: string[]): Observable<Questao[]> {
    
    let params = new HttpParams().set('ids', ids.join(','));

    return this.http.get<Questao[]>(`${API_URL}/lista`, { params });
  }
}