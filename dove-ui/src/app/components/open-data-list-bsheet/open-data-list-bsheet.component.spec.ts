import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDataListBsheetComponent } from './open-data-list-bsheet.component';

describe('OpenDataListBsheetComponent', () => {
  let component: OpenDataListBsheetComponent;
  let fixture: ComponentFixture<OpenDataListBsheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenDataListBsheetComponent]
    });
    fixture = TestBed.createComponent(OpenDataListBsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
