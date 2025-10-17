import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Interface representing a FuelExpense entity.
 */
export interface FuelExpense {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  expense_type: string;
  fuel_type?: string;
  quantity?: number;
  cost: number;
  odometer_reading?: number;
  location?: string;
  expense_date: string;
  time?: string;
  is_recurring?: boolean;
  notes?: string;
}

/**
 * Service for managing fuel expense data operations with Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class FuelExpenseService {
  private collectionName = 'fuel_expenses';
  private firestore = getFirestore();

  /**
   * Retrieves all fuel expenses from the Firestore collection.
   * @returns An Observable of an array of FuelExpense objects.
   */
  getFuelExpenses(): Observable<FuelExpense[]> {
    const fuelExpensesCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(fuelExpensesCollection)).pipe(
      map(snapshot => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FuelExpense));
        console.log('Retrieved expenses:');
        return expenses;
      }),
      catchError(error => {
        console.error('Error fetching expenses:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Adds a new fuel expense record to the Firestore collection.
   * @param fuelExpense The fuel expense data to add, excluding the id.
   * @returns An Observable of the added FuelExpense object with generated id.
   */
  addFuelExpense(fuelExpense: Omit<FuelExpense, 'id'>): Observable<FuelExpense> {
    const fuelExpensesCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(fuelExpensesCollection, fuelExpense)).pipe(
      map(docRef => ({ id: docRef.id, ...fuelExpense } as FuelExpense)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Updates an existing fuel expense record in the Firestore collection.
   * @param id The id of the fuel expense to update.
   * @param fuelExpense The updated fuel expense data, excluding the id.
   * @returns An Observable that completes when the update is done.
   */
  updateFuelExpense(id: string, fuelExpense: Omit<FuelExpense, 'id'>): Observable<void> {
    const fuelExpenseDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(fuelExpenseDoc, fuelExpense)).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Retrieves a specific fuel expense by id from the Firestore collection.
   * @param id The id of the fuel expense to retrieve.
   * @returns An Observable of the FuelExpense object.
   */
  getFuelExpense(id: string): Observable<FuelExpense> {
    const fuelExpenseDoc = doc(this.firestore, this.collectionName, id);
    return from(getDoc(fuelExpenseDoc)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as FuelExpense;
        } else {
          throw new Error('Fuel expense not found');
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Deletes a fuel expense record from the Firestore collection.
   * @param id The id of the fuel expense to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteFuelExpense(id: string): Observable<void> {
    const fuelExpenseDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(fuelExpenseDoc)).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
