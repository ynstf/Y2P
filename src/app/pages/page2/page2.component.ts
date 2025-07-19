import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page2',
  templateUrl: './page2.component.html',
  styleUrls: ['./page2.component.css']
})
export class Page2Component implements OnInit {
  completed = false;
  stageText = 'Preparing the video...';
  stageIndex = 0;
  stages = [
    'Preparing the video...',
    'Analyzing audio and video...',
    'Converting to selected format...',
    'Finalizing...',
    'Conversion completed successfully!'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.runStages();
  }

  runStages() {
    const interval = setInterval(() => {
      if (this.stageIndex < this.stages.length - 1) {
        this.stageIndex++;
        this.stageText = this.stages[this.stageIndex];
      } else {
        clearInterval(interval);
        this.completed = true;
        setTimeout(() => this.router.navigate(['/download']), 1000); // auto redirect to Page 3
      }
    }, 1200); // change stage every 1.2s
  }
}
