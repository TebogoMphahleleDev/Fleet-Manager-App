import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelExpenseList } from './fuel-expense-list';

describe('FuelExpenseList', () => {
  let component: FuelExpenseList;
  let fixture: ComponentFixture<FuelExpenseList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelExpenseList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelExpenseList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
