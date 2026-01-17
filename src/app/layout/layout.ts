import { Component, inject } from '@angular/core';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';
import { Auth } from '../core/services/auth';
import { Sidebar } from '../shared/components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { BottomNav } from '../shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, RouterOutlet, Sidebar, CommonModule, BottomNav],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  public authService = inject(Auth);
  get isUserLoggedIn(): boolean {
    return !!this.authService.getToken(); 
  }

  
}
