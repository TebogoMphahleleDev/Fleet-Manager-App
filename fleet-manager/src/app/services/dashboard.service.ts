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
 * Interface for monthly trip data.
 */
export interface MonthlyTripData {
  month: string;
  trip_count: number;
}

/**
 * Interface for maintenance cost data.
 */
export interface MaintenanceCostData {
  month: string;
  cost: number;
}

/**
 * Interface for complete dashboard summary.
 */
export interface DashboardSummary {
  stats: DashboardStats;
  monthly_trips: MonthlyTripData[];
  maintenance_costs: MaintenanceCostData[];
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

    // Also include fuel expenses in maintenance costs
    const fuelExpensesRef = collection(this.firestore, 'fuel_expenses');
    const fuelSnapshot = await getDocs(fuelExpensesRef);

    fuelSnapshot.forEach(doc => {
      const data = doc.data();
      if (data['cost'] && data['expense_date']) {
        let expenseDate: Date;
        if (typeof data['expense_date'] === 'string') {
          expenseDate = new Date(data['expense_date']);
        } else if (data['expense_date'].seconds) {
          expenseDate = new Date(data['expense_date'].seconds * 1000);
        } else {
          return;
        }

        if (expenseDate >= oneYearAgo) {
          totalCost += data['cost'];
        }
      }
    });

    return totalCost;
  }

  /**
   * Get monthly trip data for the last 12 months.
   */
  getMonthlyTrips(): Observable<MonthlyTripData[]> {
    return from(this.getMonthlyTripsData()).pipe(
      map(data => data),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Get monthly maintenance cost data for the last 12 months.
   */
  getMonthlyMaintenanceCosts(): Observable<MaintenanceCostData[]> {
    return from(this.getMonthlyMaintenanceCostsData()).pipe(
      map(data => data),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Get complete dashboard summary including stats and chart data.
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    return from(Promise.all([
      this.getDashboardStats().toPromise(),
      this.getMonthlyTripsData(),
      this.getMonthlyMaintenanceCostsData()
    ])).pipe(
      map(([stats, monthly_trips, maintenance_costs]) => ({
        stats: stats!,
        monthly_trips,
        maintenance_costs
      })),
      catchError(error => throwError(() => error))
    );
  }

  private async getMonthlyTripsData(): Promise<MonthlyTripData[]> {
    const collectionRef = collection(this.firestore, 'trips');
    const snapshot = await getDocs(collectionRef);

    const monthlyData: { [key: string]: number } = {};

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

        const monthKey = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    // Get last 12 months
    const result: MonthlyTripData[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        month: monthKey,
        trip_count: monthlyData[monthKey] || 0
      });
    }

    return result;
  }

  private async getMonthlyMaintenanceCostsData(): Promise<MaintenanceCostData[]> {
    const collectionRef = collection(this.firestore, 'maintenances');
    const snapshot = await getDocs(collectionRef);

    const monthlyData: { [key: string]: number } = {};

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

        const monthKey = `${maintenanceDate.getFullYear()}-${String(maintenanceDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + data['cost'];
      }
    });

    // Also include fuel expenses
    const fuelExpensesRef = collection(this.firestore, 'fuel_expenses');
    const fuelSnapshot = await getDocs(fuelExpensesRef);

    fuelSnapshot.forEach(doc => {
      const data = doc.data();
      if (data['cost'] && data['expense_date']) {
        let expenseDate: Date;
        if (typeof data['expense_date'] === 'string') {
          expenseDate = new Date(data['expense_date']);
        } else if (data['expense_date'].seconds) {
          expenseDate = new Date(data['expense_date'].seconds * 1000);
        } else {
          return;
        }

        const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + data['cost'];
      }
    });

    // Get last 12 months
    const result: MaintenanceCostData[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        month: monthKey,
        cost: monthlyData[monthKey] || 0
      });
    }

    return result;
  }
}
