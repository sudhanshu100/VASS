import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { CodeEditorComponent } from './app/components/code-editor/code-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CodeEditorComponent],
  template: `
    <app-code-editor></app-code-editor>
  `,
})
export class App {
  name = 'Code Editor';
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});