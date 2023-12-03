import { TestBed } from '@angular/core/testing';

import { OsdService } from './osd.service';

describe('OsdService', () => {
  let service: OsdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
