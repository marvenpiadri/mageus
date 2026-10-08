/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Auth.guardService } from './auth.guard.service';

describe('Service: Auth.guard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Auth.guardService]
    });
  });

  it('should ...', inject([Auth.guardService], (service: Auth.guardService) => {
    expect(service).toBeTruthy();
  }));
});
