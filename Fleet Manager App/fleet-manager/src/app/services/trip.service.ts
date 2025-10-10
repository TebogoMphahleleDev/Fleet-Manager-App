import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  start_location: string;
  end_location: string;
  start_time: string;
  end_time: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private collectionName = 'trips';
  private firestore = getFirestore();

  getTrips(): Observable<Trip[]> {
    const tripsCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(tripsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)))
    );
  }

  addTrip(trip: Omit<Trip, 'id'>): Observable<Trip> {
    const tripsCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(tripsCollection, trip)).pipe(
      map(docRef => ({ id: docRef.id, ...trip } as Trip))
    );
  }

  updateTrip(id: string, trip: Omit<Trip, 'id'>): Observable<void> {
    const tripDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(tripDoc, trip));
  }

  deleteTrip(id: string): Observable<void> {
    const tripDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(tripDoc));
  }
}
