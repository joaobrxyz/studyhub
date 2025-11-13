import { TestBed } from '@angular/core/testing';

import { Simulado } from './simulado';

describe('Simulado', () => {
  let service: Simulado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Simulado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
