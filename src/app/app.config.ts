import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAKB6F5YvEKXv2ZXBIvLCuUs0zMTySDXMs",
  authDomain: "studyhub.com.br",
  projectId: "studyhub-3aa1f",
  storageBucket: "studyhub-3aa1f.firebasestorage.app",
  messagingSenderId: "248072449519",
  appId: "1:248072449519:web:bc94b6572fc2312aca1a1a",
  measurementId: "G-E1MLSSY1B2"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideMarkdown(),
    provideCharts(withDefaultRegisterables()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAnalytics(() => getAnalytics())
  ]
};
