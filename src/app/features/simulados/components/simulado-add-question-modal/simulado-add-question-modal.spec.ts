import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladoAddQuestionModal } from './simulado-add-question-modal';

describe('SimuladoAddQuestionModal', () => {
  let component: SimuladoAddQuestionModal;
  let fixture: ComponentFixture<SimuladoAddQuestionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladoAddQuestionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladoAddQuestionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
