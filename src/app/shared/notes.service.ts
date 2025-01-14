import { Injectable } from '@angular/core';
import { Note } from './note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  notes: Note[] = new Array<Note>();

  constructor() {
    this.loadNotes();
  }

  loadNotes() {
    const notes = localStorage.getItem('notes');
    if (notes) {
      this.notes = JSON.parse(notes);
    }
  }

  saveNotes() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  getrAll() {
    return this.notes;
  }

  get(id: number) {
    return this.notes[id];
  }

  getID(note: Note) {
    return this.notes.indexOf(note);
  }

  add(note: Note) {
    let newLength = this.notes.push(note);
    this.saveNotes();
    let index = newLength - 1;
    return index;
  }

  update(id: number, title: string, body: string, category: string) {
    let note = this.notes[id];
    note.title = title;
    note.body = body;
    note.category = category;
    this.saveNotes();
  }

  delete(id: number) {
    this.notes.splice(id, 1);
    this.saveNotes();
  }
}