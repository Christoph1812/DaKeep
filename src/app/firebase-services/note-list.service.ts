import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc, orderBy, limit, where, query } from '@angular/fire/firestore';
import { Note } from '../interfaces/note.interface';


// Angular-Dekorator, der einen globalen Singleton-Dienst erstellt und in der gesamten Anwendung verfügbar macht.
@Injectable({
  providedIn: 'root'
})

export class NoteListService implements OnDestroy {

  // Arrays zum Speichern von Notizen unterschiedlicher Arten
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  markedNotes: Note[] = [];

  // Abonnementsvariablen für Firestore-Snapshots
  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;


  // Firestore-Instanz für die Datenbankkommunikation
  firestore: Firestore = inject(Firestore);

  constructor() {
    // Beim Initialisieren des Dienstes werden Abonnements für Firestore-Snapshots eingerichtet
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
  }


  // Methode zum Löschen einer Notiz aus Firestore
  async deleteNote(colId: "notes" | "trash", docId: string) {
    // Lösche das Dokument basierend auf der übergebenen Kollektion und Dokumenten-ID
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.log(err) }
    )
  }


  // Methode zum Aktualisieren einer Notiz in Firestore
  async updateNote(note: Note) {
    if (note.id) {
      try {
        // Holen Sie die Firestore-Dokumentenreferenz basierend auf der Notiz und ihrer Kollektion
        let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
        // Aktualisiere das Dokument mit den Daten aus der Notiz
        await updateDoc(docRef, this.getCleanJson(note));
        console.log('Dokument erfolgreich aktualisiert');
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Dokuments:', error);
      }
    }
  }


  // Methode zur Erstellung eines einfachen JSON-Objekts aus einer Notiz (dient zur Datenbereinigung)
  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }


  // Methode zur Bestimmung der Kollektion (Collection) basierend auf dem Notiztyp
  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }


  // Methode zum Hinzufügen einer Notiz zur Firestore-Datenbank
  async addNote(item: Note, colId: "notes" | "trash") {
    if (colId == "notes") {
      // Fügt die Notiz zur "notes"-Kollektion in Firestore hinzu
      await addDoc(this.getNotesRef(), item).catch(
        (err) => { console.log(err) }
      ).then(
        (docRef) => { console.log("Document written with ID:", docRef) }
      )
    } else {
      // Fügt die Notiz zur "trash"-Kollektion in Firestore hinzu
      await addDoc(this.getTrashRef(), item).catch(
        (err) => { console.log(err) }
      ).then(
        (docRef) => { console.log("Document written with ID:", docRef) }
      )
    }
  }


  // Methode zur Bereinigung und Freigabe von Ressourcen beim Zerstören des Dienstes
  ngOnDestroy() {
    // Beim Zerstören des Dienstes werden die Abonnements beendet
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes();
  }


  //Methode zum aktualisieren der "trash"-Kollection in Firestore
  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }


  // Methode zum aktualsieren der "notes"-Kollection in Firestore
  subNotesList() {
    // Erstellen Sie eine Firestore-Abfrage, um die neuesten 4 Notizen zu erhalten
    const q = query(this.getNotesRef(), limit(4))
    return onSnapshot(q, (list) => {
      // Leert das "normalNotes"-Array und füllen  es mit aktualisierten Daten aus Firestore
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }


  // Methode zum aktualsieren der marked notes in Firestore
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


  // erstellt ein Note object
  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }


  // Methode zur Rückgabe der Firestore-Referenz zur "notes"-Kollektion
  getNotesRef() {
    return collection(this.firestore, 'notes')
  }


  // Methode zur Rückgabe der Firestore-Referenz zur "trash"-Kollektion
  getTrashRef() {
    return collection(this.firestore, 'trash')
  }


  // Methode zur Rückgabe der Firestore-Referenz für ein einzelnes Dokument in einer Kollektion
  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
