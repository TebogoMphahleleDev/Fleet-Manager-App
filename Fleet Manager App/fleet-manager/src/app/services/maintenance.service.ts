import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Maintenance {
  id: string;
  vehicle_id: string;
  description: string;
  date: string;
  cost: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private collectionName = 'maintenances';
  private firestore = getFirestore();

  getMaintenances(): Observable<Maintenance[]> {
    const maintenancesCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(maintenancesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Maintenance)))
    );
  }

  addMaintenance(maintenance: Omit<Maintenance, 'id'>): Observable<Maintenance> {
    const maintenancesCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(maintenancesCollection, maintenance)).pipe(
      map(docRef => ({ id: docRef.id, ...maintenance } as Maintenance))
    );
  }

  updateMaintenance(id: string, maintenance: Omit<Maintenance, 'id'>): Observable<void> {
    const maintenanceDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(maintenanceDoc, maintenance));
  }

  deleteMaintenance(id: string): Observable<void> {
    const maintenanceDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(maintenanceDoc));
  }
}
