import { animate, animation, style, transition, trigger,query,stagger } from '@angular/animations';
import { Component,ElementRef,OnInit, ViewChild } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim',[
      transition('void => *',[
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingRight: '*',
          paddingLeft: '*',
        })),
        animate(68)

      ]),
      transition('* => void',[
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0
        })),
        animate('150ms ease-out', style({
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
          'margin-bottom': 0,
        }))
      ])
    ]),
    trigger('listAnim',[
      transition('* => *',[
        query(':enter',[
          style({
            opacity: 0,
            height: 0
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ],{
          optional: true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {
  
  notes: Note[] = new Array<Note>();
  filterNotes: Note[] = new Array<Note>();
  title: string = '';
  body: string = '';

  @ViewChild('filterInput') filterInputElRef!: ElementRef<HTMLInputElement>;
  
  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    
    this.notes = this.notesService.getrAll();
    this.filterNotes = this.notes;
  }

  deleteNote(note: Note) {
    let noteId = this.notesService.getID(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);

  }
  generateNoteURL(note: Note) {
    let noteId = this.notesService.getID(note);
    return noteId.toString();
  }

  filter(query: string) {
    query = query.toLowerCase().trim();
    
    if (!query) {
      this.filterNotes = this.notes;
      return;
    }

    
    const scoredNotes = this.notes.map(note => ({
      note,
      score: this.getMatchScore(note, query)
    }));

    
    this.filterNotes = scoredNotes
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.note);
  }

  private getMatchScore(note: Note, query: string): number {
    const exactMatchScore = 3;
    const startsWithScore = 2;
    const includesScore = 1;
    let score = 0;

    
    if (note.title) {
      const titleLower = note.title.toLowerCase();
      if (titleLower === query) score = Math.max(score, exactMatchScore);
      else if (titleLower.startsWith(query)) score = Math.max(score, startsWithScore);
      else if (titleLower.includes(query)) score = Math.max(score, includesScore);
    }

    
    if (note.body) {
      const bodyLower = note.body.toLowerCase();
      if (bodyLower === query) score = Math.max(score, exactMatchScore);
      else if (bodyLower.startsWith(query)) score = Math.max(score, startsWithScore);
      else if (bodyLower.includes(query)) score = Math.max(score, includesScore);
    }

    
    if (note.category) {
      const categoryLower = note.category.toLowerCase();
      if (categoryLower === query) score = Math.max(score, exactMatchScore);
      else if (categoryLower.startsWith(query)) score = Math.max(score, startsWithScore);
      else if (categoryLower.includes(query)) score = Math.max(score, includesScore);
    }

    return score;
  }


  removeDuplicates(arr: Array<any>): Array<any> { {
    let uniqueResults: Set<any> = new Set<any>();
    arr.forEach(e => uniqueResults.add(e));
    return Array.from(uniqueResults);
  }
}
  relevantNotes(query: string): Array<Note> {
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(note => {
      if (note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }
      if (note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }
      if (note.category && note.category.toLowerCase().includes(query)) { 
        return true;
      }
      return false;
    });
    return relevantNotes;
  }
  sortByRelevancy(searchResults: Note[]) {
    let noteCountObj: { [key: string]: number } = {};
    searchResults.forEach(note => {
      let noteId = this.notesService.getID(note);
      if (noteCountObj[noteId]) {
        noteCountObj[noteId] += 1;
      } 
      else {
        noteCountObj[noteId] = 1;
      }
    });
    this.filterNotes = this.filterNotes.sort((a: Note, b: Note) => {
      let aId = this.notesService.getID(a);
      let bId = this.notesService.getID(b);
      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];
      return bCount - aCount;
    });
  }
}
