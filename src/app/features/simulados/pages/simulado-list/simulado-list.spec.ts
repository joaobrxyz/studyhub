import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladoList } from './simulado-list';

describe('SimuladoList', () => {
  let component: SimuladoList;
  let fixture: ComponentFixture<SimuladoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladoList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladoList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
