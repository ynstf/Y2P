import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-page1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page1.component.html',
  styleUrls: ['./page1.component.css']
})
export class Page1Component {
  videoUrl: string = '';
  format: string = 'mp4';

  convert() {
    console.log('Convert:', this.videoUrl, 'to format', this.format);
    

  }
  constructor(private router: Router) {}

  onSubmit() {
    
    this.router.navigate(['/convert']);
  }

}

