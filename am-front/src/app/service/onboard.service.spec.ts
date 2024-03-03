import { TestBed } from '@angular/core/testing';

import { OnboardService } from './onboard.service';

describe('OnboardService', () => {
  let service: OnboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
