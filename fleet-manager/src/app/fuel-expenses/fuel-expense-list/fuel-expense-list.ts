import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FuelExpenseService, FuelExpense } from '../../services/fuel-expense.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../popup/confirm-dialog.component';

/**
 * Fuel Expense List Component
 *
 * This component displays a list of all fuel expenses in the fleet management system.
 * It provides functionality to view, add, edit, and delete fuel expenses.
 *
 * Features:
 * - Display list of all fuel expenses with their details
 * - Navigation links to add new fuel expenses or edit existing ones
 * - Delete functionality with confirmation dialogs
 * - Error handling and loading states
 * - Automatic list refresh after operations
 */
@Component({
  selector: 'app-fuel-expense-list',
  templateUrl: './fuel-expense-list.html',
  styleUrls: ['./fuel-expense-list.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
})

export class FuelExpenseList implements OnInit {
  // Component state properties
  fuelExpenses: FuelExpense[] = [];
  errorMessage: string = '';

  /**
   * Constructor - Dependency Injection
   *
   * Initializes the component with required services.
   *
   * @param fuelExpenseService - Service for managing fuel expense data operations
   * @param cd - ChangeDetectorRef for manual change detection
   * @param dialog - MatDialog for opening confirmation dialogs
   */
  constructor(
    private fuelExpenseService: FuelExpenseService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  /**
   * Lifecycle Hook - OnInit
   *
   * Called once the component is initialized.
   * Loads the initial list of fuel expenses.
   */
  ngOnInit(): void {
    this.loadFuelExpenses();
  }

  /**
   * Loads the List of Fuel Expenses
   *
   * Fetches all fuel expenses from the service and updates the component state.
   * Handles loading states and error scenarios.
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
      },
    });
  }

  /**
   * Deletes a Fuel Expense by ID
   *
   * Removes a fuel expense from the system after confirmation.
   * Reloads the fuel expense list upon successful deletion.
   *
   * @param id - The unique identifier of the fuel expense to delete
   */
  deleteFuelExpense(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this fuel expense?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fuelExpenseService.deleteFuelExpense(id).subscribe({
          next: () => {
            console.log('Fuel expense deleted');
            this.loadFuelExpenses();
          },
          error: (err) => {
            console.error('Failed to delete fuel expense:', err);
            this.errorMessage = 'Failed to delete fuel expense';
          },
        });
      }
    });
  }
}
