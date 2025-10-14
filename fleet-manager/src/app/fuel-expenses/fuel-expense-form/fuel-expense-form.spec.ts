import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelExpenseForm } from './fuel-expense-form';

describe('FuelExpenseForm', () => {
  let component: FuelExpenseForm;
  let fixture: ComponentFixture<FuelExpenseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelExpenseForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelExpenseForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
