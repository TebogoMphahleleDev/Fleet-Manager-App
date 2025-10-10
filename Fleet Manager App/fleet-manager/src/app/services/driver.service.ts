import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Driver {
  id: string;
  name: string;
  vehicle_id?: string;
  numberOfExperience?: number;
  licenseNumber?: string;
  contactInfo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private collectionName = 'drivers';
  private firestore = getFirestore();

  getDrivers(): Observable<Driver[]> {
    const driversCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(driversCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver)))
    );
  }

  addDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    const driversCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(driversCollection, driver)).pipe(
      map(docRef => ({ id: docRef.id, ...driver } as Driver))
    );
  }

  updateDriver(id: string, driver: Omit<Driver, 'id'>): Observable<void> {
    const driverDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(driverDoc, driver));
  }

  deleteDriver(id: string): Observable<void> {
    const driverDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(driverDoc));
  }
}
