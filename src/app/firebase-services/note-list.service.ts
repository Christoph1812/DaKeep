import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc, orderBy, limit, where, query } from '@angular/fire/firestore';
import { Note } from '../interfaces/note.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService implements OnDestroy {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  markedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
  }


  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.log(err) }
    )
  }


  async updateNote(note: Note) {
    if (note.id) {
      try {
        let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
        await updateDoc(docRef, this.getCleanJson(note));
        console.log('Dokument erfolgreich aktualisiert');
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Dokuments:', error);
      }
    }
    console.log(note);
  }


  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }



  async addNote(item: Note, colId: "notes" | "trash") {
    if (colId == "notes") {
      await addDoc(this.getNotesRef(), item).catch(
        (err) => { console.log(err) }
      ).then(
        (docRef) => { console.log("Document written with ID:", docRef) }
      )
    } else {
      await addDoc(this.getTrashRef(), item).catch(
        (err) => { console.log(err) }
      ).then(
        (docRef) => { console.log("Document written with ID:", docRef) }
      )
    }
  }

  ngOnDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes();
  }


  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }


  subNotesList() {
    const q = query(this.getNotesRef(), limit(4))
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });

    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(4))
    return onSnapshot(q, (list) => {
      this.markedNotes = [];
      list.forEach(element => {
        this.markedNotes.push(this.setNoteObject(element.data(), element.id));
        console.log("okay")
      });

    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes')
  }

  getTrashRef() {
    return collection(this.firestore, 'trash')
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
