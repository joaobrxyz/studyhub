import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { SimuladoService, TentativaSimulado } from '../../services/simulado';
import { ChangeDetectorRef } from '@angular/core';
import { take } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-simulado-desempenho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './simulado-desempenho.html',
  styleUrls: ['./simulado-desempenho.css']
})
export class SimuladoDesempenho implements OnInit, AfterViewInit {
  @ViewChild('donutChart') donutCanvas!: ElementRef;
  @ViewChild('lineChart') lineCanvas!: ElementRef;

  tentativas: TentativaSimulado[] = [];
  ultimaTentativa?: TentativaSimulado;
  simuladoId: string = '';
  isLoading = true;
  tentativasParaGrafico: TentativaSimulado[] = [];
  donutChart: Chart | undefined;
  lineChart: Chart | undefined;

  constructor(
    private route: ActivatedRoute,
    private simuladoService: SimuladoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.simuladoId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarDados();
  }

  ngOnDestroy() {
    if (this.donutChart) this.donutChart.destroy();
    if (this.lineChart) this.lineChart.destroy();
  }

  ngAfterViewInit(): void {
    // Os gráficos serão inicializados após o carregamento dos dados
  }

  carregarDados() {
    this.simuladoService.listarHistoricoPorSimulado(this.simuladoId)
      .pipe(take(1))
      .subscribe({
      next: (dados) => {
        this.tentativas = dados;

        // O GRÁFICO USA APENAS AS TENTATIVAS COMPLETAS (apenasErros === false)
        this.tentativasParaGrafico = dados.filter(t => !t.apenasErros);

        if (this.tentativasParaGrafico.length > 0) {
          this.ultimaTentativa = this.tentativasParaGrafico[0];
          this.isLoading = false;  
          this.cdr.detectChanges();
          setTimeout(() => {
            this.inicializarGraficos();
          }, 0);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  inicializarGraficos() {
    if (this.donutChart) this.donutChart.destroy();
    if (this.lineChart) this.lineChart.destroy();
    if (!this.ultimaTentativa) return;
    const acertos = this.ultimaTentativa.totalAcertos;
    const erros = this.ultimaTentativa.totalQuestoes - this.ultimaTentativa.totalAcertos;

    // Gráfico de Rosca (Donut)
    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Incorretas', 'Corretas'],
        datasets: [{
          data: [erros, acertos],
          backgroundColor: ['#dc2626', '#16a34a'],
          borderWidth: 0
        }]
      },
      options: { 
        cutout: '75%', 
        responsive: true,          
        maintainAspectRatio: false,
        layout: {
          padding: 0           
        },
        plugins: { legend: { display: false } } }
    });

    // Gráfico de Evolução (Linha)
    const labelsEvolucao = [...this.tentativasParaGrafico].reverse().map((_, i) => `Simulado ${i + 1}`);
    const scoresEvolucao = [...this.tentativasParaGrafico].reverse().map(t => t.totalAcertos);

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labelsEvolucao,
        datasets: [{
          label: 'Acertos',
          data: scoresEvolucao,
          borderColor: '#2563eb',    
          backgroundColor: '#2563eb',
          borderWidth: 3,             
          tension: 0.3,              
          pointRadius: 6,            
          pointHoverRadius: 8,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0           
        },
        plugins: {
          legend: { display: false }  
        },
        scales: {
          y: {
            min: 0,
            max: this.ultimaTentativa?.totalQuestoes || 30,
            ticks: {
              stepSize: 8,
              color: '#94a3b8'
            },
            grid: {
              display: true,
              color: '#f1f5f9',
            },
            border: {
              display: true,
              dash: [5, 5], 
              color: '#f1f5f9'
            }
          },
          x: {
            grid: {
              display: false 
            },
            border: {
              display: true,
              dash: [5, 5],
              color: '#f1f5f9'
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    });
  }

  refazerErros() {
    if (!this.ultimaTentativa) return;
    this.router.navigate(['/simulados', this.simuladoId], { 
    queryParams: { 
      tentativaId: this.ultimaTentativa.id, 
      modo: 'reforco' 
    } 
  });
  }

  revisarRespostas() {
  this.router.navigate(['/simulados', this.simuladoId], {
    queryParams: { 
      tentativaId: this.ultimaTentativa?.id, 
      modo: 'revisao' 
    }
  });
}
}