import { Injectable } from '@angular/core';
import { combineLatest, merge, NEVER, Observable, Subject } from 'rxjs';
import {
  Filter,
  SearchState,
  SearchStateActionUnion,
  SearchStateUpdate,
  StateUpdateType,
} from './filters.model';
import {
  catchError,
  debounceTime,
  filter,
  map,
  scan,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { searchReducer } from './search.reducer';
import { SearchService } from './search.service';

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
export class SearchStateService {
  state$: Observable<SearchState>;

  private requestOptions$ = new Subject<any>();
  private cachedState$ = new Subject<SearchState>();
  private stateUpdate$ = new Subject<SearchStateActionUnion>();

  constructor(private searchService: SearchService) {
    /**
     * Combine incoming updates with cached state to create optimistic state.
     */
    const optimisticState$: Observable<SearchState> = this.stateUpdate$.pipe(
      scan<SearchStateActionUnion, SearchStateUpdate>(
        searchReducer,
        EMPTY_SEARCH_STATE_UPDATE
      ),
      withLatestFrom(this.cachedState$),
      map(([updates, cachedState]) =>
        this.createUpdatedState(cachedState, updates)
      ),
      /**
       * This observable is subscribed twice (validatedState$ and state$). "Share" makes sure that all operators before it will not be
       * executed for each subscriber. So the two current subscribers "share" the result of this stream.
       */
      share()
    );

    /**
     * Combine optimistic state with request params and validate it with the backend.
     */
    const validatedState$ = combineLatest(
      this.requestOptions$,
      optimisticState$.pipe(
        /**
         * Prevent server spamming
         */
        debounceTime(200),
        /**
         * Only perform a call if state is out of sync with the backend.
         */
        filter(({ hasOptimisticUpdates }) => hasOptimisticUpdates),
        /**
         * Trigger the first call without waiting for updates.
         */
        startWith(EMPTY_SEARCH_STATE)
      ),
      Object.assign
    ).pipe(
      switchMap((request) =>
        this.searchService.search$(request).pipe(
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

    /**
     * Merge the optimistic updates for instant UI changes and server validation for asynchronous confirmation/rejection of the updates.
     */
    this.state$ = merge(validatedState$, optimisticState$);
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

  /**
   * Merge state with state updates.
   */
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
}
