// PistonService: Interacts with the Piston API for code execution.
// Sends code and language details to the API and retrieves execution results.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PistonService {
  private apiUrl = 'https://emkc.org/api/v2/piston';

  constructor(private http: HttpClient) {}

  // Executes the given code in the specified language using the Piston API.
  executeCode(language: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/execute`, {
      language,
      version: '*',
      files: [
        {
          name: 'main',
          content: code
        }
      ]
    });
  }
}