import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-simulado-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './simulado-list.html',
  styleUrls: ['./simulado-list.css']
})
export class SimuladoList {

  constructor(private router: Router) {}

  addQuestao() {
    this.router.navigate(['./criar']);
  }

  simulados = [
    {
      titulo: 'Simulado de Matemática - ENEM',
      descricao: 'Um simulado com foco em progressões, geometria e funções.',
      categoria: 'Matemática',
      nivel: 'Média',
      ano: '2024',
      questoes: 10
    },
    {
      titulo: 'Simulado de Física - Concursos',
      descricao: 'Questões típicas de provas de concursos públicos.',
      categoria: 'Física',
      nivel: 'Difícil',
      ano: '2023',
      questoes: 15
    }
  ];

  
}
