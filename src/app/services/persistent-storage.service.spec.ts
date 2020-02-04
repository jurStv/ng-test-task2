import { TestBed, inject } from '@angular/core/testing';

import { PersistentStorageService, STORAGE_TOKEN, IStorage } from './persistent-storage.service';

describe('PersistentStorageService', () => {
  let testStorage: IStorage;
  let item: any;
  const key = 'key';
  beforeEach(() => {
    item = { a: 1, b: 2 };
    testStorage = {
      clear: jasmine.createSpy('clear'),
      getItem: jasmine.createSpy('getItem').and.returnValue(JSON.stringify(item)),
      removeItem: jasmine.createSpy('removeItem'),
      setItem: jasmine.createSpy('setItem'),
    };
    TestBed.configureTestingModule({
      providers: [{
        provide: STORAGE_TOKEN,
        useValue: testStorage,
      }]
    });
  });

  it('should be created', () => {
    const service: PersistentStorageService = TestBed.get(PersistentStorageService);
    expect(service).toBeTruthy();
  });

  it('should properly set item', inject(
    [PersistentStorageService],
    (storage: PersistentStorageService) => {
      storage.setItem(key, item);
      const spy: any = testStorage.setItem;
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.count()).toEqual(1);
      expect(spy).toHaveBeenCalledWith(key, JSON.stringify(item));
    }
  ));

  it('should properly get item', inject(
    [PersistentStorageService],
    (storage: PersistentStorageService) => {
      const resp = storage.getItem(key);
      const spy: any = testStorage.getItem;
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.count()).toEqual(1);
      expect(spy).toHaveBeenCalledWith(key);
      expect(resp).toEqual(item);
    }
  ));

  it('should properly remove item', inject(
    [PersistentStorageService],
    (storage: PersistentStorageService) => {
      storage.removeItem(key);
      const spy: any = testStorage.removeItem;
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.count()).toEqual(1);
      expect(spy).toHaveBeenCalledWith(key);
    }
  ));
});
