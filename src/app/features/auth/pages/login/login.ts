import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router'; 
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnDestroy {
  private auth: Auth = inject(Auth);
  private router = inject(Router);

  private loginSubscription?: Subscription;

  public isLoading = false;
  public errorMessage: string | null = null;

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/questions']);
    }
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha os campos corretamente.';
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const credentials = this.loginForm.getRawValue();

    
    this.loginSubscription = this.auth.login(credentials as any).subscribe({
      next: (response: any) => {
        this.router.navigate(['/questions']);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'E-mail ou senha inválidos.';
      },
    });
  }

  
  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }
}
