import { Injectable } from '@angular/core';
import { combineLatest, NEVER, Observable, of, Subject } from 'rxjs';
import { Filter, HashMap } from './filters.model';
import {
  debounceTime, delay,
  distinctUntilChanged,
  scan,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SERVER_SIDE_FILTERS } from './search.response';

type ActiveFiltersMap = HashMap<boolean>;

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  /**
   * Filters
   */
  filters$: Observable<Filter[]>;

  /**
   * Active filters
   */
  activeFiltersState: Observable<ActiveFiltersMap>; // active filters + optimistic updates

  private activeFiltersSubject: Subject<ActiveFiltersMap>;
  private optimisticUpdateSubject: Subject<ActiveFiltersMap | 'reset'>;

  constructor() {
    this.activeFiltersSubject = new Subject<ActiveFiltersMap>();
    this.optimisticUpdateSubject = new Subject<ActiveFiltersMap>();

    this.activeFiltersState = combineLatest(
      this.activeFiltersSubject.asObservable(),
      this.optimisticUpdateSubject.pipe(
        scan(
          (acc, update) => (update === 'reset' ? {} : { ...acc, ...update }),
          {}
        )
      ),
      (activeFilters, unprocessedFilters) => ({
        ...activeFilters,
        ...unprocessedFilters,
      })
    ).pipe(startWith({}));

    this.filters$ = this.activeFiltersState.pipe(
      distinctUntilChanged((previousFiltersMap, newFiltersMap) => {
        const previousFilters = Object.keys(previousFiltersMap);
        if (previousFilters.length !== Object.keys(newFiltersMap).length) {
          return false;
        }

        return previousFilters.every(
          (filterKey) =>
            previousFiltersMap[filterKey] === newFiltersMap[filterKey]
        );
      }),
      delay(100),
      switchMap((activeFilters) => {
        console.log('New server params: ', activeFilters);

        if (
          activeFilters['fail-to-activate'] ||
          activeFilters['fail-to-deactivate'] === false
        ) {

          this.clearOptimisticUpdates();
          return NEVER;
        }

        return of(SERVER_SIDE_FILTERS).pipe(
          tap(() => {
            this.activeFiltersSubject.next(activeFilters);
            this.clearOptimisticUpdates();
          })
        );
      })
    );
  }

  activateFilter(filter: Filter) {
    this.optimisticUpdateSubject.next({
      [filter.lookupValue]: true,
    });
  }

  deactivateFilter(filter: Filter) {
    this.optimisticUpdateSubject.next({
      [filter.lookupValue]: false,
    });
  }

  private clearOptimisticUpdates() {
    this.optimisticUpdateSubject.next('reset');
  }
}
