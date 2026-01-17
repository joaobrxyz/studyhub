import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladoCreateModal } from './simulado-create-modal';

describe('SimuladoCreateModal', () => {
  let component: SimuladoCreateModal;
  let fixture: ComponentFixture<SimuladoCreateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladoCreateModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladoCreateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
