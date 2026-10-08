/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Embed_Service } from './embed.service';

describe('Service: Embed_service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Embed_Service]
    });
  });

  it('should ...', inject([Embed_Service], (service: Embed_Service) => {
    expect(service).toBeTruthy();
  }));
});
