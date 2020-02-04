import { TestBed } from '@angular/core/testing';

import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FavoritesService,
    ]
  }));

  it('should be created', () => {
    const service: FavoritesService<any> = TestBed.get(FavoritesService);
    expect(service).toBeTruthy();
  });

  // ran out of time so can't finish this part
  /* TODO: finish tasks for FavoritesService */
});
