import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  inputValue = '';
  baseBackend = 'y2p-api.vercel.app';
  //baseBackend = '127.0.0.1:8000';
  convertedValue = '';
  taskId: string | null = null;
  taskStatus: string | null = null;
  taskMessage: string | null = null;
  downloadUrl: string | null = null;
  isProcessing = false;
  pollInterval: any = null;
  errorMessage: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(private http: HttpClient) {}

  convert() {
    // Validate input
    if (!this.inputValue.trim()) {
      this.errorMessage = 'Please enter a YouTube URL';
      return;
    }
    
    if (!this.isValidYouTubeUrl(this.inputValue)) {
      this.errorMessage = 'Please enter a valid YouTube URL';
      return;
    }

    // Reset state
    this.isProcessing = true;
    this.taskId = null;
    this.taskStatus = null;
    this.taskMessage = 'Starting conversion...';
    this.downloadUrl = null;
    this.errorMessage = null;
    this.convertedValue = '';

    // Call the API to start processing
    const apiUrl = `https://${this.baseBackend}/process`;
    const payload = { url: this.inputValue };

    this.http.post<any>(apiUrl, payload).subscribe({
      next: (response) => {
        this.taskId = response.task_id;
        this.taskStatus = 'pending';
        this.taskMessage = 'Task submitted. Processing...';
        
        // Start polling for status
        this.startPolling();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.errorMessage = 'Failed to start processing. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  startPolling() {
    // Clear any existing interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    
    // Poll every 5 seconds
    this.pollInterval = setInterval(() => {
      if (!this.taskId) return;
      
      const statusUrl = `https://${this.baseBackend}/status/${this.taskId}`;
      
      this.http.get<any>(statusUrl).subscribe({
        next: (statusResponse) => {
          this.taskStatus = statusResponse.status;
          this.taskMessage = statusResponse.message;
          
          // Handle completed state
          if (statusResponse.status === 'completed') {
            clearInterval(this.pollInterval);
            this.isProcessing = false;
            this.downloadUrl = `https://${this.baseBackend}/download/${this.taskId}`;
            this.convertedValue = 'Conversion completed successfully!';
          }
          
          // Handle failed state
          if (statusResponse.status === 'failed') {
            clearInterval(this.pollInterval);
            this.isProcessing = false;
            this.errorMessage = statusResponse.error || 'Processing failed.';
          }
        },
        error: (err) => {
          console.error('Status Check Error:', err);
          this.errorMessage = 'Error checking task status.';
          clearInterval(this.pollInterval);
          this.isProcessing = false;
        }
      });
    }, 5000); // Check every 5 seconds

    // Clean up interval after 5 minutes to prevent infinite polling
    setTimeout(() => {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        if (this.isProcessing) {
          this.errorMessage = 'Processing timeout. Please try again.';
          this.isProcessing = false;
        }
      }
    }, 300000); // 5 minutes
  }

  // Function to extract video ID from YouTube URL
  getYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Function to get video thumbnail
  getVideoThumbnail(url: string): string | null {
    if (!url) return null;
    
    const videoId = this.getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  }

  // Validate YouTube URL
  isValidYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  // Handle thumbnail loading error
  onThumbnailError(event: any) {
    // Fallback to default resolution thumbnail
    const videoId = this.getYouTubeVideoId(this.inputValue);
    if (videoId) {
      event.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // Mobile menu toggle
  toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
      navLinks.classList.toggle('active');
    }
  }

  // Smooth scroll to section
  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu if open
      const navLinks = document.getElementById('navLinks');
      if (navLinks) {
        navLinks.classList.remove('active');
      }
    }
  }

  // Clean up when component is destroyed
  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
}