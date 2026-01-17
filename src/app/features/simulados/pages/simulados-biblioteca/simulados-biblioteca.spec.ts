import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladosBiblioteca } from './simulados-biblioteca';

describe('SimuladosBiblioteca', () => {
  let component: SimuladosBiblioteca;
  let fixture: ComponentFixture<SimuladosBiblioteca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladosBiblioteca]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladosBiblioteca);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
