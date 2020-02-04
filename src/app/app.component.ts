import * as R from 'ramda';
import { Component, OnInit, ViewChild, OnDestroy, TrackByFunction } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';
import { merge, Subject } from 'rxjs';
import { startWith, switchMap, debounceTime, distinctUntilChanged, pluck, map, tap, withLatestFrom, exhaustMap } from 'rxjs/operators';

import { YoutubeService, FavoritesService, PersistentStorageService } from './services';
import { INITIAL_SEARCH_VALUE, YOUTUBE_WATCH_URL, FAVORITES_VIDEOS_STORAGE_KEY } from './app.constants';
import { SearchResult } from './interfaces';

const DEBOUNCE_TIME = 300; // ms
interface IVideoElement {
  id: string;
  videoUrl: string;
  publishedAt: string;
  title: string;
  description: string;
}

const toVideoElement = (item: SearchResult): IVideoElement => ({
  id: R.path(['id', 'videoId'], item),
  videoUrl: R.compose(
    R.concat(YOUTUBE_WATCH_URL),
    R.path(['id', 'videoId']),
  )(item),
  publishedAt: R.path(['snippet', 'publishedAt'], item),
  title: R.path(['snippet', 'title'], item),
  description: R.path(['snippet', 'description'], item),
});

const ELEMENT_DATA: IVideoElement[] = [];

export function favoritesFactory(storage: PersistentStorageService) {
  const favoritesFromStorage = R.defaultTo([], storage.getItem(FAVORITES_VIDEOS_STORAGE_KEY));
  const favoritesService = new FavoritesService(favoritesFromStorage);

  return favoritesService;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: FavoritesService,
      useFactory: favoritesFactory,
      deps: [PersistentStorageService],
    }
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  public searchControl = new FormControl(INITIAL_SEARCH_VALUE);
  @ViewChild('videosTable', { static: true }) private table: MatTable<IVideoElement>;
  @ViewChild('favoritesTable', { static: true }) private favoritesTable: MatTable<IVideoElement>;

  public displayedColumns: string[] = ['select', 'title', 'description', 'publishedAt'];
  public dataSource = new MatTableDataSource<IVideoElement>(ELEMENT_DATA);
  public favoritesDataSource: MatTableDataSource<IVideoElement>;
  public trackById: TrackByFunction<IVideoElement> = R.compose(R.prop('id'), R.nthArg(1));

  public get hasAnyVideos() {
    return this.dataSource.data.length > 0;
  }

  public get hasAnyFavoriteVideos() {
    return this.favorites.getLength() > 0;
  }

  // Save token for future in case needs More
  private nextPageToken: string;
  // Stream of More button triggers
  private more$ = new Subject<void>();

  constructor(
    private readonly youtube: YoutubeService,
    private readonly storage: PersistentStorageService,
    public readonly favorites: FavoritesService<IVideoElement>,
  ) {
    this.favoritesDataSource = new MatTableDataSource<IVideoElement>(favorites.get());
  }

  ngOnInit() {
    //  Stream of search control values changes
    const controlValue$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value)
    );
    //  Stream of initial data requests
    const dataFlow$ = controlValue$.pipe(
      debounceTime(DEBOUNCE_TIME),
      distinctUntilChanged(),
      switchMap((query) => this.youtube.searchVideos(query)),
      tap(({nextPageToken}) => this.nextPageToken = nextPageToken),
      pluck('items'),
      map<SearchResult[], IVideoElement[]>(R.map(toVideoElement)),
      tap((elements) => this.dataSource.data = elements),
    );
    //  Stream of favorites
    const favoritesFlow$ = this.favorites.change$.pipe(
      tap((elements) => this.storage.setItem(FAVORITES_VIDEOS_STORAGE_KEY, elements)),
      tap((elements) => this.favoritesDataSource.data = elements),
      tap(() => this.favoritesTable && this.favoritesTable.renderRows()),
    );
    //  Stream of more data requests
    const moreRequest$ = this.more$.pipe(
      debounceTime(DEBOUNCE_TIME),
      withLatestFrom(controlValue$),
      exhaustMap(([_, query]) => this.youtube.searchVideos(query, this.nextPageToken)),
      tap(({nextPageToken}) => this.nextPageToken = nextPageToken),
      pluck('items'),
      map<SearchResult[], IVideoElement[]>(R.map(toVideoElement)),
      tap((elements) => this.dataSource.data = R.compose(
        R.uniqBy(R.prop('id')),
        R.concat(this.dataSource.data),
      )(elements)),
    );

    merge(dataFlow$, favoritesFlow$, moreRequest$).pipe(
      untilComponentDestroyed(this),
      tap(() => this.table && this.table.renderRows()),
    ).subscribe();
  }

  ngOnDestroy() {}

  public loadMore() {
    this.more$.next();
  }

  public isAllSelected() {
    return this.favorites.hasMany(this.dataSource.data);
  }

  public isAnySelected() {
    return this.favorites.hasAny(this.dataSource.data);
  }

  public masterToggle() {
    this.isAllSelected() ?
        this.favorites.removeMany(this.dataSource.data) :
        this.favorites.addMany(this.dataSource.data);
  }

  public toggle(item: IVideoElement) {
    this.favorites.has(item) ?
      this.favorites.remove(item) :
        this.favorites.add(item);
  }

  public checkboxLabel(row?: IVideoElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'favor' : 'disfavor'} all`;
    }
    return `${this.favorites.has(row) ? 'disfavor' : 'favor'} row`;
  }

}
