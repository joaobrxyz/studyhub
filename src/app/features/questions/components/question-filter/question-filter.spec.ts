import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionFilter } from './question-filter';

describe('QuestionFilter', () => {
  let component: QuestionFilter;
  let fixture: ComponentFixture<QuestionFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
