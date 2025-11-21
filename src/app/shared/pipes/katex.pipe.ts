import { Pipe, PipeTransform } from '@angular/core';

// Declaração do KaTeX global
declare const katex: any;

@Pipe({
  name: 'katex',
  standalone: true
})
export class KatexPipe implements PipeTransform {

  // Remova o constructor(private sanitizer: DomSanitizer) {}

  // Mude o retorno de SafeHtml para string
  transform(value: string): string {
    if (!value) return '';

    // A lógica de substituição continua a mesma
    const textoRenderizado = value.replace(/\$(.*?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false 
        });
      } catch (e) {
        return match;
      }
    });

    // Retorne a string direto, sem passar pelo bypassSecurityTrustHtml
    return textoRenderizado;
  }
}