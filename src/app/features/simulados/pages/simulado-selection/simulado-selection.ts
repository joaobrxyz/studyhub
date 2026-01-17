import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SimuladoCreateModal } from '../../components/simulado-create-modal/simulado-create-modal';
@Component({
  selector: 'app-simulado-selection',
  imports: [CommonModule, RouterLink, SimuladoCreateModal],
  templateUrl: './simulado-selection.html',
  styleUrl: './simulado-selection.css',
})
export class SimuladoSelection {
  exibirModal: boolean = false;

  abrirModalManual() {
    this.exibirModal = true; 
  }

  fecharModal() {
    this.exibirModal = false; 
  }

  salvarNovoSimulado(dados: {nome: string, descricao: string}) {
    console.log('Dados recebidos do modal:', dados);
    this.fecharModal();
    // Próximo passo: navegar para a tela de adicionar questões levando esses dados
  }
}
