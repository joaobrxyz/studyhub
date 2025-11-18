import { Component, inject, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Auth } from '../../../../core/services/auth';

function passwordMatcher(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnDestroy {
  private auth: Auth = inject(Auth);
  private registerSubscription?: Subscription;

  public isLoading = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;

  public registerForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),

      confirmPassword: new FormControl('', [Validators.required]),

      gender: new FormControl(''),

      birthDate: new FormControl(''),
      city: new FormControl(''),
      country: new FormControl(''),
    },
    { validators: passwordMatcher }
  );

  public onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const form = this.registerForm.getRawValue() as any;
    const payload = {
      nome: form.name,
      email: form.email,
      senha: form.password,
    };

    this.registerSubscription = this.auth.register(payload as any).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando para o login...';
      },
      error: (err: any) => {
        console.error('Erro no cadastro:', err);
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Ocorreu um erro ao tentar se cadastrar.';
      },
    });
  }

  ngOnDestroy(): void {
    this.registerSubscription?.unsubscribe();
  }
}
