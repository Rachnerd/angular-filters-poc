import { Injectable } from '@angular/core';
import { combineLatest, merge, NEVER, Observable, of, Subject } from 'rxjs';
import {
  Filter,
  SearchState,
  SearchStateUpdate,
  SearchStateUpdateEventUnion,
  StateUpdateType,
} from './filters.model';
import {
  catchError,
  debounceTime,
  delay,
  filter,
  map,
  scan,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { SERVER_SIDE_FILTERS } from './search.response';

const EMPTY_SEARCH_STATE_UPDATE = {
  activeFiltersUpdateMap: {},
  amountOfResultsUpdate: undefined,
};

const EMPTY_SEARCH_STATE = {
  hasOptimisticUpdates: false,
  activeFiltersMap: {},
  amountOfResults: undefined,
  filters: [],
};

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  state$: Observable<SearchState>;

  private requestOptions$ = new Subject<any>();
  private cachedState$ = new Subject<SearchState>();
  private stateUpdate$ = new Subject<SearchStateUpdateEventUnion>();

  constructor() {
    this.initState();
  }

  activateFilter({ lookupValue }: Filter) {
    this.stateUpdate$.next({
      type: StateUpdateType.ACTIVATE_FILTER,
      payload: lookupValue,
    });
  }

  deactivateFilter({ lookupValue }: Filter) {
    this.stateUpdate$.next({
      type: StateUpdateType.DEACTIVATE_FILTER,
      payload: lookupValue,
    });
  }

  loadResults(amount: number) {
    this.stateUpdate$.next({
      type: StateUpdateType.AMOUNT_OF_RESULTS,
      payload: amount,
    });
  }

  search() {
    this.requestOptions$.next({});
  }

  private initState() {
    const optimisticState$: Observable<SearchState> = this.stateUpdate$.pipe(
      scan<SearchStateUpdateEventUnion, SearchStateUpdate>(
        this.stateUpdateReducer,
        EMPTY_SEARCH_STATE_UPDATE
      ),
      withLatestFrom(this.cachedState$),
      map(([updates, cachedState]) =>
        this.createUpdatedState(cachedState, updates)
      ),
      share()
    );

    const validatedState$ = combineLatest(
      this.requestOptions$,
      optimisticState$.pipe(
        debounceTime(200),
        filter(({ hasOptimisticUpdates }) => hasOptimisticUpdates),
        startWith(EMPTY_SEARCH_STATE)
      ),
      Object.assign
    ).pipe(
      switchMap((request) =>
        this.performRequest(request).pipe(
          tap((newState) => {
            this.cachedState$.next(newState);
            this.stateUpdate$.next({
              type: StateUpdateType.RESET,
              payload: undefined,
            });
          }),
          catchError((e) => {
            this.stateUpdate$.next({
              type: StateUpdateType.RESET,
              payload: undefined,
            });
            return NEVER;
          })
        )
      )
    );

    this.state$ = merge(validatedState$, optimisticState$);
  }

  private stateUpdateReducer(
    queuedUpdates: SearchStateUpdate,
    event: SearchStateUpdateEventUnion
  ): SearchStateUpdate {
    if (event.type === StateUpdateType.RESET) {
      return EMPTY_SEARCH_STATE_UPDATE;
    }

    if (event.type === StateUpdateType.AMOUNT_OF_RESULTS) {
      return {
        ...queuedUpdates,
        amountOfResultsUpdate: event.payload,
      };
    }

    const { activeFiltersUpdateMap } = queuedUpdates;

    if (
      event.type === StateUpdateType.ACTIVATE_FILTER ||
      event.type === StateUpdateType.DEACTIVATE_FILTER
    ) {
      const activate = event.type === StateUpdateType.ACTIVATE_FILTER;
      if (activeFiltersUpdateMap[event.payload] === !activate) {
        // Cancel opposite queued update.
        delete activeFiltersUpdateMap[event.payload];
        return {
          ...queuedUpdates,
          activeFiltersUpdateMap,
        };
      } else {
        // Add to queued updates.
        return {
          ...queuedUpdates,
          activeFiltersUpdateMap: {
            ...activeFiltersUpdateMap,
            [event.payload]: activate,
          },
        };
      }
    }
  }

  private createUpdatedState(
    { activeFiltersMap, filters, amountOfResults }: SearchState,
    { activeFiltersUpdateMap, amountOfResultsUpdate }: SearchStateUpdate
  ): SearchState {
    const amountOfResultsChanged =
      amountOfResultsUpdate !== undefined &&
      amountOfResultsUpdate !== amountOfResults;

    const filtersChanged = Object.keys(activeFiltersUpdateMap).length !== 0;

    return {
      hasOptimisticUpdates: amountOfResultsChanged || filtersChanged,
      activeFiltersMap: {
        ...activeFiltersMap,
        ...activeFiltersUpdateMap,
      },
      amountOfResults: amountOfResultsUpdate || amountOfResults,
      filters,
    };
  }

  private performRequest(request) {
    return of(request).pipe(
      delay(100),
      map((response) => {
        if (
          response.activeFiltersMap['fail-to-activate'] ||
          response.activeFiltersMap['fail-to-deactivate'] === false
        ) {
          throw Error();
        }
        return {
          hasOptimisticUpdates: false,
          activeFiltersMap: response.activeFiltersMap,
          filters: SERVER_SIDE_FILTERS,
          amountOfResults: response.amountOfResults,
        };
      })
    );
  }
}
