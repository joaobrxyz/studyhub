import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladoResponder } from './simulado-responder';

describe('SimuladoResponder', () => {
  let component: SimuladoResponder;
  let fixture: ComponentFixture<SimuladoResponder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladoResponder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladoResponder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
