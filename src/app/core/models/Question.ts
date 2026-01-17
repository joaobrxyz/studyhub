export interface Questao {
  id: string;
  enunciado: string;
  resposta: string;
  alternativas: string[];
  disciplina: string;
  dificuldade: string;
  ano: string; 
  instituicao: string;
  topicos: string[];
  resolucaoTexto?: string;
  resolucaoVideoId?: string;
}

export interface PageableResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; 
}