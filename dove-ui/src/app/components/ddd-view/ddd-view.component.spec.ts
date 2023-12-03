import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DddViewComponent } from './ddd-view.component';

describe('DddViewComponent', () => {
  let component: DddViewComponent;
  let fixture: ComponentFixture<DddViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DddViewComponent]
    });
    fixture = TestBed.createComponent(DddViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
