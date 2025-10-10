import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Interface representing a Driver entity.
 */
export interface Driver {
  id: string;
  name: string;
  vehicle_id?: string;
  numberOfExperience?: number;
  licenseNumber?: string;
  contactInfo?: string;
}

/**
 * Service for managing driver data operations with Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private collectionName = 'drivers';
  private firestore = getFirestore();

  /**
   * Retrieves all drivers from the Firestore collection.
   * @returns An Observable of an array of Driver objects.
   */
  getDrivers(): Observable<Driver[]> {
    const driversCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(driversCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver))),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Adds a new driver to the Firestore collection.
   * @param driver The driver data to add, excluding the id.
   * @returns An Observable of the added Driver object with generated id.
   */
  addDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    const driversCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(driversCollection, driver)).pipe(
      map(docRef => ({ id: docRef.id, ...driver } as Driver)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Updates an existing driver in the Firestore collection.
   * @param id The id of the driver to update.
   * @param driver The updated driver data, excluding the id.
   * @returns An Observable that completes when the update is done.
   */
  updateDriver(id: string, driver: Omit<Driver, 'id'>): Observable<void> {
    const driverDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(driverDoc, driver)).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Deletes a driver from the Firestore collection.
   * @param id The id of the driver to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteDriver(id: string): Observable<void> {
    const driverDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(driverDoc)).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
