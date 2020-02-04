import * as R from 'ramda';
import { Injectable, Optional } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export interface IFavoriteItem {
  id: any;
}

@Injectable({
  providedIn: null,
})
export class FavoritesService<T extends IFavoriteItem> {
  public get change$(): Observable<T[]> {
    return this.favoritesSource;
  }

  private favoritesSource: BehaviorSubject<T[]>;
  private favoritesDict = new Map<any, T>();

  constructor(@Optional() initalFavorites: T[]) {
    if (R.and(R.not(R.is(Array, initalFavorites)), R.not(R.isNil(initalFavorites)))) {
      throw new Error('Favorites must be array!');
    }
    const favorites = R.defaultTo([], initalFavorites);
    this.favoritesSource = new BehaviorSubject(favorites);
    R.forEach((item: T) => this.favoritesDict.set(item.id, item), favorites);
  }

  get(): T[] {
    return this.favoritesSource.value;
  }

  getLength(): number {
    return this.favoritesSource.value.length;
  }

  isEmpty() {
    return this.getLength() === 0;
  }

  add(value: T) {
    const favorites = this.favoritesSource.value;
    const favoritesUpdated: T[] = R.append(value, favorites);
    this.favoritesDict.set(value.id, value);
    this.favoritesSource.next(favoritesUpdated);
  }

  addMany(values: T[]) {
    const favorites = this.favoritesSource.value;
    const favoritesUpdated: T[] = R.compose(
      R.uniqBy(R.prop('id')),
      R.concat(favorites),
    )(values);
    R.forEach((item: T) => this.favoritesDict.set(item.id, item), values);
    this.favoritesSource.next(favoritesUpdated);
  }

  remove(value: T) {
    const favorites = this.favoritesSource.value;
    const favoritesUpdated: T[] = R.filter(R.compose(R.not, R.propEq('id', value.id)), favorites);
    this.favoritesDict.delete(value.id);
    this.favoritesSource.next(favoritesUpdated);
  }

  removeMany(values: T[]) {
    const favorites = this.favoritesSource.value;
    const favoritesUpdated: T[] = R.filter((item: T) => !R.any(R.propEq('id', item.id), values), favorites);
    R.forEach((item: T) => this.favoritesDict.delete(item.id), values);
    this.favoritesSource.next(favoritesUpdated);
  }

  replaceAllWith(values: T[]) {
    this.favoritesDict.clear();
    R.forEach((item: T) => this.favoritesDict.set(item.id, item), values);
    this.favoritesSource.next(values);
  }

  clear() {
    this.favoritesSource.next([]);
    this.favoritesDict.clear();
  }

  has(value: T): boolean {
    const hasAny = this.favoritesDict.has(value.id);

    return hasAny;
  }

  hasMany(values: T[]): boolean {
    const hasMany = !R.any((item: T) => !this.favoritesDict.has(item.id), values);

    return hasMany;
  }

  hasAny(values: T[]): boolean {
    const hasAny = R.any((item: T) => this.favoritesDict.has(item.id), values);

    return hasAny;
  }
}
