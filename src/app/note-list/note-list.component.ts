import { Component } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { NoteListService } from '../firebase-services/note-list.service'

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  noteList: Note[] = []; // Array für die anzuzeigenden Notizen
  favFilter: "all" | "fav" = "all"; // Aktueller Favoritenfilter ("all" oder "fav")
  status: "notes" | "trash" = "notes"; // Aktueller Anzeigemodus ("notes" oder "trash")

  constructor(public noteService: NoteListService) {
    // Konstruktor, der den NoteListService-Dienst injiziert
  }

  // Methode zum Abrufen der anzuzeigenden Notizen basierend auf dem Status und Filter
  getList(): Note[] {
    if (this.status == "notes") {
      if (this.favFilter == "all")
        return this.noteService.normalNotes;
      else {
        return this.noteService.markedNotes;
      }
    } else {
      return this.noteService.trashNotes;
    }
  }


  // Methode zum Ändern des Favoritenfilters
  changeFavFilter(filter: "all" | "fav") {
    this.favFilter = filter;
  }


  // Methode zum Ändern des Anzeigemodus zwischen "notes" und "trash"
  changeTrashStatus() {
    if (this.status == "trash") {
      this.status = "notes";
    } else {
      this.status = "trash";
      this.favFilter = "all";
    }
  }
}