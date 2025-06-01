// FileService: Provides file management functionalities.
// Handles saving, loading, deleting, and retrieving files.

import { Injectable } from '@angular/core';
import { CodeFile } from '../models/code-file';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly STORAGE_KEY = 'code_files';

  constructor() {}

  // Saves a file to local storage.
  saveFile(file: CodeFile): void {
    const files = this.getAllFiles();
    files.push(file);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
  }

  // Retrieves all files from local storage.
  getAllFiles(): CodeFile[] {
    const filesStr = localStorage.getItem(this.STORAGE_KEY);
    return filesStr ? JSON.parse(filesStr) : [];
  }

  // Deletes a file from local storage by its ID.
  deleteFile(id: string): void {
    const files = this.getAllFiles().filter(f => f.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
  }
}