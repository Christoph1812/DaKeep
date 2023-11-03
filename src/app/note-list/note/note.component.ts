import { Component, Input } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { NoteListService } from '../../firebase-services/note-list.service'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  @Input() note!: Note; // Eingabeattribut, das eine Note von übergeordneten Komponenten erhält
  edit = false; // Flag, um den Bearbeitungsmodus anzuzeigen oder auszublenden
  hovered = false; // Flag, um anzuzeigen, ob die Maus über der Notiz schwebt

  constructor(private noteService: NoteListService) { }

  // Methode zum Ändern des Markierungsstatus der Notiz
  changeMarkedStatus() {
    this.note.marked = !this.note.marked;
    this.saveNote();
  }


  // Methode, um den "hovered"-Status auf "false" zu setzen, wenn nicht im Bearbeitungsmodus
  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }


  // Methode, um den Bearbeitungsmodus zu aktivieren
  openEdit() {
    this.edit = true;
  }


  // Methode, um den Bearbeitungsmodus zu deaktivieren und die Notiz zu speichern
  closeEdit() {
    this.edit = false;
    this.saveNote();
  }


  // Methode, um die Notiz in den Papierkorb zu verschieben
  moveToTrash() {
    if (this.note.id) {
      this.note.type = "trash"; // Den Typ der Notiz auf "trash" ändern
      let docId = this.note.id; // Die ID der Notiz abrufen
      this.noteService.addNote(this.note, "trash") // Die Notiz in den Papierkorb verschieben
      this.noteService.deleteNote("notes", docId); // Die Notiz aus dem normalen Notizspeicher löschen
    }
  }

  // Methode, um die Notiz aus dem Papierkorb in die normalen Notizen zu verschieben
  moveToNotes() {
    if (this.note.id) {
      this.note.type = "note";
      let docId = this.note.id;
      this.noteService.addNote(this.note, "notes")
      this.noteService.deleteNote("trash", docId);
    }
  }


  // Methode, um die Notiz endgültig zu löschen
  deleteNote() {
    if (this.note.id) {
      let docId = this.note.id;
      this.noteService.deleteNote("trash", docId);
    }
  }


  // Methode, um die Notiz zu speichern und Änderungen in der Datenbank zu aktualisieren
  saveNote() {
    this.noteService.updateNote(this.note);
  }
}
