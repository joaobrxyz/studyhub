import { Component, signal } from '@angular/core';
import { Layout } from './layout/layout';
import { Auth } from './core/services/auth';
import { Injectable, inject } from '@angular/core';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject as injectAnalytics } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  imports: [Layout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('studyhub');
  private authService = inject(Auth);

  ngOnInit() {
    // Ao abrir o site (ou dar F5), ele calcula quanto tempo falta e arma a bomba relógio
    this.authService.verificarEAgendarLogout();
    injectAnalytics();
    injectSpeedInsights();
  }
}


