import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Add this
import { HttpClientModule } from '@angular/common/http'; // Add this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent,
    HttpClientModule
  ], // Add this
  template: `<app-home></app-home>`
})
export class AppComponent {}

