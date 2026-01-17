import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { Auth } from '../../../core/services/auth';
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterModule, CommonModule],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {
  router = inject(Router);
  authService = inject(Auth);
  elRef = inject(ElementRef);
  navRecolhida: boolean = false;

  exibirMenuExtra: boolean = false; 


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Se o menu estiver aberto e o clique for fora do componente 'app-bottom-nav'
    if (this.exibirMenuExtra && !this.elRef.nativeElement.contains(event.target)) {
      this.exibirMenuExtra = false;
    }
  }

  // Função para esconder a barra
  ocultarMenu() {
    this.navRecolhida = true;
    this.exibirMenuExtra = false; // Fecha o popup ao esconder
  }

  // Função para trazer a barra de volta
  mostrarMenu() {
    this.navRecolhida = false;
    this.exibirMenuExtra = false;
  }

  toggleMenu() {
    this.exibirMenuExtra = !this.exibirMenuExtra;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
