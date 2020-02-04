import { Injectable, InjectionToken, Inject } from '@angular/core';

export const STORAGE_TOKEN = new InjectionToken<IStorage>('StorageToken');
export interface IStorage {
  clear(): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

@Injectable({
  providedIn: 'root'
})
export class PersistentStorageService {
  constructor(@Inject(STORAGE_TOKEN) private readonly storage: IStorage) {}

  setItem(key: string, value: any) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string) {
    const value = this.storage.getItem(key);
    return JSON.parse(value);
  }

  removeItem(key) {
    this.storage.removeItem(key);
  }
}
