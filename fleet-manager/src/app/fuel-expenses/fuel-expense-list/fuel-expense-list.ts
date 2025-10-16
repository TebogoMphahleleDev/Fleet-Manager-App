import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FuelExpenseService, FuelExpense } from '../../services/fuel-expense.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Component for displaying a list of fuel expenses.
 * Allows viewing and editing fuel expenses.
 */
@Component({
  selector: 'app-fuel-expense-list',
  templateUrl: './fuel-expense-list.html',
  styleUrls: ['./fuel-expense-list.scss'],
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  standalone: true
})
export class FuelExpenseList implements OnInit {
  fuelExpenses: FuelExpense[] = [];
  errorMessage: string = '';

  /**
   * Constructor for FuelExpenseListComponent.
   * @param fuelExpenseService Service for managing fuel expense data.
   */
  constructor(private fuelExpenseService: FuelExpenseService, private cd: ChangeDetectorRef) {}

  /**
   * Initializes the component by loading the list of fuel expenses.
   */
  ngOnInit(): void {
    this.loadFuelExpenses();
  }

  /**
   * Loads the list of fuel expenses from the service and updates the component state.
   */
  loadFuelExpenses(): void {
    this.fuelExpenseService.getFuelExpenses().subscribe({
      next: (data) => {
        console.log('Loaded fuel expenses:');
        this.fuelExpenses = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load fuel expenses:', err);
        this.errorMessage = 'Failed to load fuel expenses';
      }
    });
  }
}
