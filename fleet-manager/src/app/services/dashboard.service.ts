import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Interface defining the structure of dashboard statistics data.
 * This ensures type safety when working with dashboard stats throughout the application.
 */
export interface DashboardStats {
  total_vehicles: number;     
  total_drivers: number;     
  total_trips: number;        
  trips_this_month: number;   
  maintenance_costs: number;  
}

/**
 * Service responsible for fetching and calculating dashboard statistics from Firebase Firestore.
 * This service handles all data retrieval operations for the dashboard component,
 * providing a clean separation of concerns between data access and UI logic.
 *
 * Services in Angular are singleton objects that can be injected into components
 * to share data and functionality across the application.
 */
@Injectable({
  providedIn: 'root'  
})
export class DashboardService {
  
  private firestore = getFirestore();

  
  constructor() {}

  /**
   * This method gets all the dashboard statistics.
   * It returns an Observable, which is like a promise that can give data over time.
   * We use Observable because Angular likes them for handling async operations.
   */
  getDashboardStats(): Observable<DashboardStats> {
   
    return from(Promise.all([
      this.getCount('vehicles'),      
      this.getCount('drivers'),       
      this.getCount('trips'),         
      this.getTripsThisMonth(),       
      this.getMaintenanceCosts()      
    ])).pipe(
      // The map operator transforms the data. Here, we turn the array into an object
      map(([total_vehicles, total_drivers, total_trips, trips_this_month, maintenance_costs]) => ({
        total_vehicles,
        total_drivers,
        total_trips,
        trips_this_month,
        maintenance_costs
      })),
      
      catchError(error => throwError(() => error))
    );
  }

  /**
   * This is a helper method to count how many documents are in a collection.
   * Collections in Firestore are like tables in a database.
   */
  private async getCount(collectionName: string): Promise<number> {
    
    const collectionRef = collection(this.firestore, collectionName);
    
    const snapshot = await getDocs(collectionRef);
    
    return snapshot.size;
  }

  /**
   * This method counts how many trips happened this month.
   * It looks at the start_time field in each trip document.
   */
  private async getTripsThisMonth(): Promise<number> {

    const collectionRef = collection(this.firestore, 'trips');
    const snapshot = await getDocs(collectionRef);

   
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let count = 0; 
    snapshot.forEach(doc => {
      const data = doc.data();  
      if (data['start_time']) {  
       
        let startTime: Date;
        if (typeof data['start_time'] === 'string') {
          
          startTime = new Date(data['start_time']);
        } else if (data['start_time'].seconds) {
         
          startTime = new Date(data['start_time'].seconds * 1000);
        } else {
          return;  
        }

        // Check if the trip is in the current month and year
        if (startTime.getMonth() === currentMonth && startTime.getFullYear() === currentYear) {
          count++;  
        }
      }
    });
    return count;
  }

  /**
   * This method adds up all the maintenance costs from the last 12 months.
   * It looks at the 'date' field in maintenance documents.
   */
  private async getMaintenanceCosts(): Promise<number> {
    
    const collectionRef = collection(this.firestore, 'maintenances');
    const snapshot = await getDocs(collectionRef);

    let totalCost = 0; 
    // Calculate what date was 12 months ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data['cost'] && data['date']) {  
        
        let maintenanceDate: Date;
        if (typeof data['date'] === 'string') {
          maintenanceDate = new Date(data['date']);
        } else if (data['date'].seconds) {
          maintenanceDate = new Date(data['date'].seconds * 1000);
        } else {
          return; 
        }

        
        if (maintenanceDate >= oneYearAgo) {
          totalCost += data['cost'];  
        }
      }
    });
    return totalCost;
  }
}
