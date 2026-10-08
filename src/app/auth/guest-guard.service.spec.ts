/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GuestGuardService } from './guest-guard.service';

describe('Service: GuestGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuestGuardService]
    });
  });

  it('should ...', inject([GuestGuardService], (service: GuestGuardService) => {
    expect(service).toBeTruthy();
  }));
});
