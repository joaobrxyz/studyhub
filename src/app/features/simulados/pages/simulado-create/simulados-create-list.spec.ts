import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladosCreate } from './simulados-create';

describe('SimuladoCreate', () => {
  let component: SimuladosCreate;
  let fixture: ComponentFixture<SimuladosCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladosCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimuladosCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
