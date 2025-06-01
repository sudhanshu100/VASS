// CollaborationService: Manages real-time collaboration features.
// Handles room creation, joining, leaving, and synchronization of code changes.

import { Injectable } from '@angular/core';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private doc: Y.Doc;
  private provider: WebsocketProvider;
  private binding: MonacoBinding | null = null;
  private _activeRoom = new BehaviorSubject<string>('');
  activeRoom$ = this._activeRoom.asObservable();

  constructor() {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      'ws://localhost:1234',
      'monaco-demo',
      this.doc
    );
  }

  // Creates a new collaboration room and binds the editor to it.
  createRoom(editor: editor.IStandaloneCodeEditor, roomId: string) {
    if (this._activeRoom.value) {
      this.disconnect();
    }
    
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      'ws://localhost:1234',
      roomId,
      this.doc
    );

    const ytext = this.doc.getText('monaco');
    this.binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      this.provider.awareness
    );

    this.provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      role: 'owner'
    });

    this._activeRoom.next(roomId);
  }

  // Joins an existing collaboration room and binds the editor to it.
  joinRoom(editor: editor.IStandaloneCodeEditor, roomId: string) {
    if (this._activeRoom.value) {
      this.disconnect();
    }

    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      'ws://localhost:1234',
      roomId,
      this.doc
    );

    const ytext = this.doc.getText('monaco');
    this.binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      this.provider.awareness
    );

    this.provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      role: 'participant'
    });

    this._activeRoom.next(roomId);
  }

  // Disconnects from the current collaboration room.
  disconnect() {
    if (this.binding) {
      this.binding.destroy();
    }
    this.provider.disconnect();
    this.doc.destroy();
    this._activeRoom.next('');
  }

  // Returns the ID of the currently active collaboration room.
  getActiveRoom() {
    return this._activeRoom.value;
  }
}