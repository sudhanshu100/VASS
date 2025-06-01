// CodeEditorComponent: Provides a code editor interface with Monaco Editor, file management, and collaboration features.
// Handles code execution, file
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import * as monaco from 'monaco-editor';
import { PistonService } from '../../services/piston.service';
import { FileService } from '../../services/file.service';
import { CollaborationService } from '../../services/collaboration.service';
import { CodeFile, Language } from '../../models/code-file';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  editor: any;
  output = '';
  fileName = '';
  selectedLanguage = 'javascript';
  savedFiles: CodeFile[] = [];
  roomId = '';
  isInRoom = false;
  activeRoom = '';

  languages: Language[] = [
    { id: 'c', name: 'C', extension: '.c' },
    { id: 'cpp', name: 'C++', extension: '.cpp' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'html', name: 'HTML', extension: '.html' },
    { id: 'css', name: 'CSS', extension: '.css' }
  ];

  dropdownOpen = false;
  isExpanded: boolean = false;
  isVisible: boolean = false;


  constructor(
    private pistonService: PistonService,
    private fileService: FileService,
    private collaborationService: CollaborationService
  ) {}

  toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

  toggleCollabBtn() {
    this.isExpanded = !this.isExpanded;
  }

selectLanguage(langId: string) {
  this.selectedLanguage = langId;
  this.updateEditorLanguage();
  this.dropdownOpen = false;
}

getLanguageName(id: string): string {
  return this.languages.find(lang => lang.id === id)?.name || id;
}


  ngOnInit() {
    this.initializeEditor();
    this.loadSavedFiles();
    this.subscribeToRoomChanges();
  }

  ngOnDestroy() {
    this.collaborationService.disconnect();
  }

  private initializeEditor() {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: '',
      language: this.selectedLanguage,
      theme: 'vs-dark',
      automaticLayout: true
    });
  }

  private subscribeToRoomChanges() {
    this.collaborationService.activeRoom$.subscribe(room => {
      this.isInRoom = !!room;
      this.activeRoom = room;
    });
  }

  private handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error);
    alert(`An error occurred: ${error.message}`);
  }

  updateEditorLanguage() {
    monaco.editor.setModelLanguage(this.editor.getModel(), this.selectedLanguage);
  }

  createRoom() {
    if (!this.roomId) return alert('Please enter a room ID');
    this.collaborationService.createRoom(this.editor, this.roomId);
  }

  joinRoom() {
    if (!this.roomId) return alert('Please enter a room ID');
    this.collaborationService.joinRoom(this.editor, this.roomId);
  }

  leaveRoom() {
    this.collaborationService.disconnect();
    this.roomId = '';
  }

  loadSavedFiles() {
    this.savedFiles = this.fileService.getAllFiles();
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fileName = file.name;
    const extension = file.name.split('.').pop()?.toLowerCase();
    const language = this.languages.find(lang => lang.extension.includes(extension!));
    if (language) this.selectedLanguage = language.id;

    const reader = new FileReader();
    reader.onload = e => this.editor.setValue(e.target?.result as string);
    reader.readAsText(file);
    this.fileInput.nativeElement.value = '';
  }

  downloadFile(file?: CodeFile) {
    const content = file?.content || this.editor.getValue();
    const filename = file?.name || this.fileName || `code${this.getFileExtension()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private getFileExtension(): string {
    return this.languages.find(lang => lang.id === this.selectedLanguage)?.extension || '.txt';
  }

  runCode() {
    this.pistonService.executeCode(this.selectedLanguage, this.editor.getValue()).subscribe(
      response => this.output = response.run.output || 'No output',
      error => this.handleError(error, 'runCode')
    );
  }

 saveFile() {
  // If the input box is hidden, show it and return early
  if (!this.isVisible) {
    this.isVisible = true;
    return;
  }

  // If input box is already visible and fileName is empty, don't save
  if (!this.fileName.trim()) {
    this.isVisible = false; // hide the input box
    return;
  }

  // Save the file
  const newFile: CodeFile = {
    id: Date.now().toString(),
    name: this.fileName.trim(),
    language: this.selectedLanguage,
    content: this.editor.getValue(),
    created: new Date()
  };

  try {
    this.fileService.saveFile(newFile);
    this.loadSavedFiles();
    this.fileName = '';
    this.isVisible = false; // hide input after saving
  } catch (error) {
    this.handleError(error, 'saveFile');
  }
}


  loadFile(file: CodeFile) {
    this.editor.setValue(file.content);
    this.selectedLanguage = file.language;
    this.fileName = file.name;
    this.updateEditorLanguage();
  }

  deleteFile(id: string) {
    this.fileService.deleteFile(id);
    this.loadSavedFiles();
  }
  
}