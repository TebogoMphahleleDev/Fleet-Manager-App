import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private collectionName = 'vehicles';
  private firestore = getFirestore();

  getVehicles(): Observable<Vehicle[]> {
    const vehiclesCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(vehiclesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)))
    );
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    const vehiclesCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(vehiclesCollection, vehicle)).pipe(
      map(docRef => ({ id: docRef.id, ...vehicle } as Vehicle))
    );
  }

  updateVehicle(id: string, vehicle: Omit<Vehicle, 'id'>): Observable<void> {
    const vehicleDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(vehicleDoc, vehicle));
  }

  deleteVehicle(id: string): Observable<void> {
    const vehicleDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(vehicleDoc));
  }
}
