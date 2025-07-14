import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Add HttpClient

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
export class HomeComponent {
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

  constructor(private http: HttpClient) {} // Inject HttpClient

  convert() {
    // Reset state
    this.isProcessing = true;
    this.taskId = null;
    this.taskStatus = null;
    this.taskMessage = null;
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
  }

  // Clean up when component is destroyed
  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
}