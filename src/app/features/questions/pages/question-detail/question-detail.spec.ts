import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionDetail } from './question-detail';

describe('QuestionDetail', () => {
  let component: QuestionDetail;
  let fixture: ComponentFixture<QuestionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
