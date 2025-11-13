import { Component } from '@angular/core';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
