import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeImageMarkdown',
  standalone: true
})
export class RemoveImageMarkdownPipe implements PipeTransform {

  // Adicionamos o parâmetro 'keepImages' com valor padrão 'false'
  transform(value: string, keepImages: boolean = false): string {
    if (!value) return '';

    let text = value;

    // 1. Lógica de Imagem (Só roda se keepImages for false)
    if (!keepImages) {
      const imageMarkdownRegex = /!\[.*?\]\(.*?\)/g;
      text = text.replace(imageMarkdownRegex, '<span class="badge bg-light text-secondary border mb-2">[Imagem na questão completa]</span>');
    }

    // 2. Lógica de Citação (Roda SEMPRE)
    // Encontra "Disponível em: ..." e envolve em uma div para estilizarmos
    const citationRegex = /(Disponível em:.*)/gi;
    text = text.replace(citationRegex, '<div class="citation-text">$1</div>');

    return text;
  }

}