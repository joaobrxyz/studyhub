import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladoEditar } from './simulado-editar';

describe('SimuladoEditar', () => {
  let component: SimuladoEditar;
  let fixture: ComponentFixture<SimuladoEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladoEditar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladoEditar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
