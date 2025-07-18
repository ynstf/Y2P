import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page2.component.html',
  styleUrls: ['./page2.component.css']
})

export class Page2Component implements OnInit {
  progress: number = 0;
  completed: boolean = false;
constructor(private router: Router) {}
  ngOnInit() {
    const interval = setInterval(() => {
      this.progress += 5;
      if (this.progress >= 100) {
        this.progress = 100;
        this.completed = true;
        clearInterval(interval);
        setTimeout(() => this.router.navigate(['/download']), 1000);
      }
    }, 300); 
  }
}




