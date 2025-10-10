import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Interface representing a Maintenance entity.
 */
export interface Maintenance {
  id: string;
  vehicle_id: string;
  description: string;
  date: string;
  cost: number;
}

/**
 * Service for managing maintenance data operations with Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private collectionName = 'maintenances';
  private firestore = getFirestore();

  /**
   * Retrieves all maintenances from the Firestore collection.
   * @returns An Observable of an array of Maintenance objects.
   */
  getMaintenances(): Observable<Maintenance[]> {
    const maintenancesCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(maintenancesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Maintenance))),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Adds a new maintenance record to the Firestore collection.
   * @param maintenance The maintenance data to add, excluding the id.
   * @returns An Observable of the added Maintenance object with generated id.
   */
  addMaintenance(maintenance: Omit<Maintenance, 'id'>): Observable<Maintenance> {
    const maintenancesCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(maintenancesCollection, maintenance)).pipe(
      map(docRef => ({ id: docRef.id, ...maintenance } as Maintenance)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Updates an existing maintenance record in the Firestore collection.
   * @param id The id of the maintenance to update.
   * @param maintenance The updated maintenance data, excluding the id.
   * @returns An Observable that completes when the update is done.
   */
  updateMaintenance(id: string, maintenance: Omit<Maintenance, 'id'>): Observable<void> {
    const maintenanceDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(maintenanceDoc, maintenance)).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Deletes a maintenance record from the Firestore collection.
   * @param id The id of the maintenance to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteMaintenance(id: string): Observable<void> {
    const maintenanceDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(maintenanceDoc)).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
