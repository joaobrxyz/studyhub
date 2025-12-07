import { Component, inject } from '@angular/core'; // Usando inject para ficar mais limpo
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuestionFilter } from '../../../questions/components/question-filter/question-filter';
import { SimuladoService } from '../../services/simulado';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-simulados-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, QuestionFilter],
  templateUrl: './simulados-create.html',
  styleUrls: ['./simulados-create.css']
})
export class SimuladosCreate {
  
  private fb = inject(FormBuilder);
  private simuladoService = inject(SimuladoService);
  private router = inject(Router);

  simuladoForm: FormGroup;
  isLoading = false;

  // Variável para guardar o que vem do componente <app-question-filter>
  filtrosSelecionados = {
    disciplinas: [] as string[],
    dificuldades: [] as string[],
    instituicoes: [] as string[],
    anos: [] as string[]
  };

  constructor() {
    this.simuladoForm = this.fb.group({
      
      titulo: ['', Validators.required],
      descricao: [''],
      quantidade: [10, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  // Esse método recebe os dados quando o usuário mexe no componente de filtro
  atualizarFiltros(event: any) {
    console.log('Filtros recebidos:', event);
    this.filtrosSelecionados = event;
  }

  salvar() {
    if (this.simuladoForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulário inválido',
        text: 'Por favor, preencha o título e verifique a quantidade.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    this.isLoading = true;
    const formVal = this.simuladoForm.value;

    // Monta o objeto final misturando o Form (Título/Qtd) + Filtros
    const payload = {
      titulo: formVal.titulo,
      descricao: formVal.descricao,
      quantidade: formVal.quantidade,
      
      disciplinas: this.filtrosSelecionados.disciplinas,
      dificuldades: this.filtrosSelecionados.dificuldades,
      instituicoes: this.filtrosSelecionados.instituicoes,
      anos: this.filtrosSelecionados.anos
    };

    this.simuladoService.gerarSimulado(payload).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Sucesso!',
          text: 'Seu simulado foi gerado corretamente.',
          icon: 'success',
          confirmButtonText: 'Ir para Lista',
          confirmButtonColor: '#0d6efd' // Cor azul do Bootstrap
        }).then((result) => {
          // Só redireciona depois que o usuário clica em OK ou fecha o popup
          if (result.isConfirmed || result.isDismissed) {
            this.router.navigate(['/simulados']);
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;

        // Popup de Erro
        if (err.status === 404) {
           Swal.fire('Ops!', 'Não encontramos questões suficientes com esses filtros.', 'warning');
        } else {
           Swal.fire('Erro', 'Não foi possível criar o simulado.', 'error');
        }
      }
    });
  }
}