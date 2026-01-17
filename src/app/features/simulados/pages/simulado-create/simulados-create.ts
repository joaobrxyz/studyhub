import { Component, inject } from '@angular/core'; // Usando inject para ficar mais limpo
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { QuestionFilter } from '../../../questions/components/question-filter/question-filter';
import { SimuladoService } from '../../services/simulado';
import Swal from 'sweetalert2';
import { take } from 'rxjs';

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
    anos: [] as string[],
    apenasErros: false,
    comResolucao: false,
    comVideo: false
  };

  constructor() {
    this.simuladoForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: [''],
      quantidade: [10, [Validators.required, Validators.min(1), Validators.max(100)]]
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
      anos: this.filtrosSelecionados.anos,

      apenasErros: this.filtrosSelecionados.apenasErros,
      comResolucao: this.filtrosSelecionados.comResolucao,
      comVideo: this.filtrosSelecionados.comVideo
    };

    this.simuladoService.gerarSimulado(payload)
    .pipe(take(1))
    .subscribe({
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

        // 1. Tratamento para Limite Atingido (429)
        if (err.status === 429) {
          Swal.fire({
            title: 'Limite Atingido!',
            text: 'Você já usou seus 2 simulados automáticos gratuitos deste mês. Quer simulados ilimitados?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ser premium agora',
            cancelButtonText: 'Depois',
            confirmButtonColor: '#f59e0b', 
            cancelButtonColor: '#6c757d'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/premium']);
            }
          });
          return; // Para não cair no erro genérico abaixo
        }

        // 2. Tratamento para Questões não encontradas (404)
        if (err.status === 404) {
          Swal.fire({
            icon: 'warning',
            title: 'Ops!',
            text: 'Não encontramos questões suficientes com esses filtros. Tente selecionar mais disciplinas ou anos.',
            confirmButtonColor: '#0d6efd'
          });
          return;
        }

        // 3. Erro Genérico
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível criar o simulado. Tente novamente mais tarde.',
          confirmButtonColor: '#d33'
        });
      }
    }); 
  } 
}