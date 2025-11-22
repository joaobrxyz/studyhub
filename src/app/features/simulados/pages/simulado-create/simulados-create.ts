import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
selector: 'app-simulados-create',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './simulados-create.html',
styleUrls: ['./simulados-create.css']
})
export class SimuladosCreate {
simuladoForm: FormGroup;


constructor(private fb: FormBuilder) {
this.simuladoForm = this.fb.group({
titulo: ['', Validators.required],
descricao: [''],
categoria: ['', Validators.required],
tempo: ['', Validators.required],
questoes: this.fb.array([])
});
}


get questoes() {
return this.simuladoForm.get('questoes') as FormArray;
}


addQuestao() {
const questao = this.fb.group({
enunciado: ['', Validators.required],
alternativaA: ['', Validators.required],
alternativaB: ['', Validators.required],
alternativaC: ['', Validators.required],
alternativaD: ['', Validators.required],
correta: ['', Validators.required]
});


this.questoes.push(questao);
}


removeQuestao(index: number) {
this.questoes.removeAt(index);
}


salvar() {
if (this.simuladoForm.valid) {
console.log('Simulado criado:', this.simuladoForm.value);
}
}
}