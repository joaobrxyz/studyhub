import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumPlan } from './premium-plan';

describe('PremiumPlan', () => {
  let component: PremiumPlan;
  let fixture: ComponentFixture<PremiumPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
