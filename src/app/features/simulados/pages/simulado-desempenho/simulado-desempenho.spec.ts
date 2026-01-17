import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladoDesempenho } from './simulado-desempenho';

describe('SimuladoDesempenho', () => {
  let component: SimuladoDesempenho;
  let fixture: ComponentFixture<SimuladoDesempenho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladoDesempenho]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladoDesempenho);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
