import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page2',
  templateUrl: './page2.component.html',
  styleUrls: ['./page2.component.css']
})
export class Page2Component implements OnInit {
  progress = 0;
  completed = false;
  intervalId?: any;

  ngOnInit(): void {
    this.startProgress();
  }

  startProgress() {
    this.progress = 0;
    this.completed = false;

    this.intervalId = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 1;
      } else {
        this.completed = true;
        clearInterval(this.intervalId);
      }
    }, 50); 
  }}