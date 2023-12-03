import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawDataComponent } from './raw-data.component';

describe('RawDataComponent', () => {
  let component: RawDataComponent;
  let fixture: ComponentFixture<RawDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RawDataComponent]
    });
    fixture = TestBed.createComponent(RawDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
