import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface representing a Vehicle entity.
 */
export interface Vehicle {
  id: string;
  name: string;
  model: string;
  make: string;
  color: string;
  registrationNumber: string;
  licenseExpiryDate: string;
  yearOfCar: number;
}

/**
 * Service for managing vehicle data operations with Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private collectionName = 'vehicles';
  private firestore = getFirestore();

  /**
   * Retrieves all vehicles from the Firestore collection.
   * @returns An Observable of an array of Vehicle objects.
   */
  getVehicles(): Observable<Vehicle[]> {
    const vehiclesCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(vehiclesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)))
    );
  }

  /**
   * Retrieves all vehicles from Firestore using async/await.
   * @returns A promise that resolves to an array of vehicle objects.
   */
  async getVehicles_v2() {
    let items: any[] = [];
    const itemsCollection = collection(this.firestore, this.collectionName);
    const querySnapshot = await getDocs(itemsCollection);
    items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return items
  }

  /**
   * Adds a new vehicle to the Firestore collection.
   * @param vehicle The vehicle data to add, excluding the id.
   * @returns An Observable of the added Vehicle object with generated id.
   */
  addVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    const vehiclesCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(vehiclesCollection, vehicle)).pipe(
      map(docRef => ({ id: docRef.id, ...vehicle } as Vehicle))
    );
  }

  /**
   * Updates an existing vehicle in the Firestore collection.
   * @param id The id of the vehicle to update.
   * @param vehicle The updated vehicle data, excluding the id.
   * @returns An Observable that completes when the update is done.
   */
  updateVehicle(id: string, vehicle: Omit<Vehicle, 'id'>): Observable<void> {
    const vehicleDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(vehicleDoc, vehicle));
  }

  /**
   * Deletes a vehicle from the Firestore collection.
   * @param id The id of the vehicle to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteVehicle(id: string): Observable<void> {
    const vehicleDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(vehicleDoc));
  }
}
