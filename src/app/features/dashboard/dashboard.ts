import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, Usuario } from '../profile/services/user-service';
import { HistoricoService } from '../questions/services/historico-service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ViewportScroller } from '@angular/common';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

export interface HistoricoItem {
  pergunta: string;
  materia: string;
  tempo: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private historicoService = inject(HistoricoService);
  private userService = inject(UserService);
  private scroller = inject(ViewportScroller);

  usuario: Usuario | undefined;
  primeiroNome: string = '';
  totalResolvidas: number = 0;
  taxaAcertos: number = 0;
  streak: number = 0;
  historico: HistoricoItem[] = [];

  // --- CONFIGURAÇÃO GRÁFICO DE BARRAS (Desempenho) ---
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 100,
      ticks: {
        stepSize: 25,
        color: '#9ca3af'
      },
      border: { display: false }, 
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        tickBorderDash: [5, 5] 
      }
    },
    x: {
      ticks: {
         color: '#9ca3af',
         font: {
          size: 10.8 
        }
        },
      border: { display: false },
      grid: { display: false }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: { usePointStyle: true, pointStyle: 'circle', padding: 20 }
    }
  }
};

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Acertos (%)', 
        backgroundColor: '#2563eb', 
        borderRadius: 4, 
        barPercentage: 0.6,
        categoryPercentage: 0.8 
      },
      { 
        data: [], 
        label: 'Erros (%)', 
        backgroundColor: '#e5e7eb', 
        borderRadius: 4, 
        barPercentage: 0.6, 
        categoryPercentage: 0.8 
      }
    ]
  };

  // --- CONFIGURAÇÃO GRÁFICO DE LINHA (Evolução) ---
  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 10,
      border: { display: false },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        tickBorderDash: [5, 5]
      },
      ticks: { stepSize: 1, precision: 0 }
    },
    x: {
      border: { display: false },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
        tickBorderDash: [5, 5]
      }
    }
  },
  plugins: { legend: { display: false } }
};

  public lineChartData: ChartData<'line'> = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        label: 'Questões Resolvidas',
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4, // Curva suave
        pointBackgroundColor: '#2563eb',
        pointRadius: 5
      }
    ]
  };

  ngOnInit(): void {
    this.scroller.scrollToPosition([0, 0]);
    this.carregarDadosUsuario();
    this.carregarEstatisticas();
    this.carregarDadosGrafico();
    this.carregarDadosEvolucao();
  }

  carregarDadosGrafico() {
    this.historicoService.getDesempenhoMateria().pipe(take(1))
    .subscribe(dados => {
      this.barChartData = {
        labels: dados.map(d => d.materia),
        datasets: [
          { 
            ...this.barChartData.datasets[0], 
            data: dados.map(d => d.acertos) 
          },
          { 
            ...this.barChartData.datasets[1], 
            data: dados.map(d => d.erros) 
          }
        ]
      };
    });
  }

  carregarDadosEvolucao() {
    this.historicoService.getEvolucaoSemanal()
    .pipe(take(1))
    .subscribe({
      next: (dadosDoBack) => {
        const labels: string[] = [];
        const valores: number[] = [];
        
        // Mapa vazio para acumular os valores
        const mapaDados = new Map<string, number>();

        // Soma  das quantidades para datas repetidas
        dadosDoBack.forEach(d => {
          const valorAtual = mapaDados.get(d.data) || 0;
          mapaDados.set(d.data, valorAtual + d.quantidade);
        });

        // Gráfico para os últimos 7 dias (incluindo hoje, 04/01)
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          
          const dataFormatada = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          
          labels.push(this.obterNomeDia(d));
          valores.push(mapaDados.get(dataFormatada) || 0);
        }

        this.lineChartData = {
          labels: labels,
          datasets: [{ ...this.lineChartData.datasets[0], data: valores }]
        };
      }
    });
  }

  private obterNomeDia(data: Date): string {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[data.getDay()];
  }

  carregarDadosUsuario() {
    this.userService.getUsuarioLogado()
    .pipe(take(1))
    .subscribe({
      next: (dados) => {
        this.usuario = dados;
        this.primeiroNome = dados.nome.split(' ')[0]; 
        this.streak = dados.streakAtual || 0;
      }
    });
  }

  carregarEstatisticas() {
    this.historicoService.getTotalResolvidas()
    .pipe(take(1))
    .subscribe(total => this.totalResolvidas = total);
    this.historicoService.getEstatisticasGerais()
    .pipe(take(1))
    .subscribe(res => {
      if (res.totalTentativas > 0) {
        this.taxaAcertos = Math.round((res.totalAcertos / res.totalTentativas) * 100);
      }
    });
  }
}