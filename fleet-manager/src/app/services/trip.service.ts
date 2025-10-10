import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface representing a Trip entity.
 */
export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  start_location: string;
  end_location: string;
  start_time: string;
  end_time: string;
}

/**
 * Service for managing trip data operations with Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class TripService {
  private collectionName = 'trips';
  private firestore = getFirestore();

  /**
   * Retrieves all trips from the Firestore collection.
   * @returns An Observable of an array of Trip objects.
   */
  getTrips(): Observable<Trip[]> {
    const tripsCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(tripsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)))
    );
  }

  /**
   * Adds a new trip to the Firestore collection.
   * @param trip The trip data to add, excluding the id.
   * @returns An Observable of the added Trip object with generated id.
   */
  addTrip(trip: Omit<Trip, 'id'>): Observable<Trip> {
    const tripsCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(tripsCollection, trip)).pipe(
      map(docRef => ({ id: docRef.id, ...trip } as Trip))
    );
  }

  /**
   * Updates an existing trip in the Firestore collection.
   * @param id The id of the trip to update.
   * @param trip The updated trip data, excluding the id.
   * @returns An Observable that completes when the update is done.
   */
  updateTrip(id: string, trip: Omit<Trip, 'id'>): Observable<void> {
    const tripDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(tripDoc, trip));
  }

  /**
   * Deletes a trip from the Firestore collection.
   * @param id The id of the trip to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteTrip(id: string): Observable<void> {
    const tripDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(tripDoc));
  }
}
