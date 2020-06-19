import { SearchStateService } from './search-state.service';
import { TestScheduler } from 'rxjs/testing';
import { SearchStateActionUnion, StateUpdateType } from './filters.model';
import resetAllMocks = jest.resetAllMocks;

describe('SearchState service', () => {
  let scheduler: TestScheduler;

  const searchService = {
    search$: jest.fn(),
  } as any;

  let searchStateService: SearchStateService;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected);
    });
    searchStateService = new SearchStateService(searchService as any);
  });

  afterEach(() => {
    resetAllMocks();
  });

  it('should emit the first state after the request has completed', () => {
    /**
     * requestOptions$: a--
     * search$:         -a|
     *
     * Result:          -a
     */
    scheduler.run(({ expectObservable, cold, hot, flush }) => {
      /* tslint:disable-next-line */
      searchStateService['requestOptions$'] = hot('a', {
        a: {},
      });

      searchService.search$.mockReturnValueOnce(
        cold('-a|', {
          a: {
            hasOptimisticUpdates: false,
            activeFiltersMap: {},
          },
        })
      );

      searchStateService.init();

      expectObservable(searchStateService.state$).toBe('-a', {
        a: {
          hasOptimisticUpdates: false,
          activeFiltersMap: {},
        },
      });

      flush();

      expect(searchService.search$).toHaveBeenCalledTimes(1);
    });
  });

  it('should emit optimistic state and then validated state', () => {
    /**
     * requestOptions$: a--
     * search$:         -a|       -b|
     * stateUpdate$:    --a
     *
     * Result:          -ab 199ms -c--
     */
    scheduler.run(({ expectObservable, cold, hot, flush }) => {
      /**
       * Request options emit immediately.
       */
      /* tslint:disable-next-line */
      searchStateService['requestOptions$'] = hot('a', {
        a: {},
      });

      searchService.search$
        .mockReturnValueOnce(
          cold('-a|', {
            a: {
              hasOptimisticUpdates: false,
              activeFiltersMap: {},
              filters: [],
              amountOfResults: 0,
            },
          })
        )
        .mockReturnValueOnce(
          cold('-b|', {
            b: {
              hasOptimisticUpdates: false,
              activeFiltersMap: { A: true },
              filters: [],
              amountOfResults: 0,
            },
          })
        );

      /* tslint:disable-next-line */
      searchStateService['stateUpdate$'] = hot('--a', {
        a: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
      });

      searchStateService.init();

      expectObservable(searchStateService.state$).toBe('-ab 199ms -c', {
        a: {
          hasOptimisticUpdates: false,
          activeFiltersMap: {},
        },
        b: {
          hasOptimisticUpdates: true,
          activeFiltersMap: { A: true },
        },
        c: {
          hasOptimisticUpdates: false,
          activeFiltersMap: { A: true },
        },
      });

      flush();

      expect(searchService.search$).toHaveBeenCalledTimes(2);
    });
  });

  it('should collect incoming updates and request the server after 200ms of no more incoming updates', () => {
    /**
     * requestOptions$: a---
     * search$:         -a|                     -b|
     * stateUpdate$:    --a 20ms b 20ms c
     * state$:          -ab 20ms c 20ms d 199ms -e
     */
    scheduler.run(({ expectObservable, cold, hot, flush }) => {
      /* tslint:disable-next-line */
      searchStateService['requestOptions$'] = hot('a', {
        a: {},
      });

      searchService.search$
        .mockReturnValueOnce(
          cold('-a|', {
            a: {
              hasOptimisticUpdates: false,
              activeFiltersMap: {},
              filters: [],
              amountOfResults: 0,
            },
          })
        )
        .mockReturnValueOnce(
          cold('-b|', {
            b: {
              hasOptimisticUpdates: false,
              activeFiltersMap: { A: true, B: true, C: true },
              filters: [],
              amountOfResults: 0,
            },
          })
        );

      /* tslint:disable-next-line */
      searchStateService['stateUpdate$'] = hot('--a 20ms b 20ms c', {
        a: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
        b: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'B',
        } as SearchStateActionUnion,
        c: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'C',
        } as SearchStateActionUnion,
      });

      searchStateService.init();

      expectObservable(searchStateService.state$).toBe(
        '-ab 20ms c 20ms d 199ms -e',
        {
          a: {
            hasOptimisticUpdates: false,
            activeFiltersMap: {},
          },
          b: {
            hasOptimisticUpdates: true,
            activeFiltersMap: { A: true },
          },
          c: {
            hasOptimisticUpdates: true,
            activeFiltersMap: { A: true, B: true },
          },
          d: {
            hasOptimisticUpdates: true,
            activeFiltersMap: { A: true, B: true, C: true },
          },
          e: {
            hasOptimisticUpdates: false,
            activeFiltersMap: { A: true, B: true, C: true },
          },
        }
      );

      flush();

      expect(searchService.search$).toHaveBeenCalledTimes(2);
    });
  });

  it('should not send a request if incoming updates cancel each other out', () => {
    /**
     * requestOptions$: a---
     * search$:         -a|
     * stateUpdate$:    --ab
     * state$:          -aba 200ms ---
     */
    scheduler.run(({ expectObservable, cold, hot, flush }) => {
      /* tslint:disable-next-line */
      searchStateService['requestOptions$'] = hot('a', {
        a: {},
      });

      searchService.search$.mockReturnValueOnce(
        cold('-a|', {
          a: {
            hasOptimisticUpdates: false,
            activeFiltersMap: {},
            filters: [],
            amountOfResults: 0,
          },
        })
      );

      /* tslint:disable-next-line */
      searchStateService['stateUpdate$'] = hot('--ab', {
        a: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
        b: {
          type: StateUpdateType.DEACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
      });

      searchStateService.init();

      expectObservable(searchStateService.state$).toBe('-aba 200ms ---', {
        a: {
          hasOptimisticUpdates: false,
          activeFiltersMap: {},
        },
        b: {
          hasOptimisticUpdates: true,
          activeFiltersMap: { A: true },
        },
      });

      flush();

      expect(searchService.search$).toHaveBeenCalledTimes(1);
    });
  });

  it('should send a request with only relevant updates', () => {
    /**
     * requestOptions$: a---
     * search$:         -a|         -b|
     * stateUpdate$:    --abc
     * state$:          -abac 199ms -d
     */
    scheduler.run(({ expectObservable, cold, hot, flush }) => {
      /* tslint:disable-next-line */
      searchStateService['requestOptions$'] = hot('a', {
        a: {},
      });

      searchService.search$
        .mockReturnValueOnce(
          cold('-a|', {
            a: {
              hasOptimisticUpdates: false,
              activeFiltersMap: {},
              filters: [],
              amountOfResults: 0,
            },
          })
        )
        .mockReturnValueOnce(
          cold('-b|', {
            b: {
              hasOptimisticUpdates: false,
              activeFiltersMap: {},
              filters: [],
              amountOfResults: 10,
            },
          })
        );

      /* tslint:disable-next-line */
      searchStateService['stateUpdate$'] = hot('--abc', {
        a: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
        b: {
          type: StateUpdateType.DEACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
        c: {
          type: StateUpdateType.AMOUNT_OF_RESULTS,
          payload: 10,
        } as SearchStateActionUnion,
      });

      searchStateService.init();

      expectObservable(searchStateService.state$).toBe('-abac 199ms -d', {
        a: {
          hasOptimisticUpdates: false,
          activeFiltersMap: {},
        },
        b: {
          hasOptimisticUpdates: true,
          activeFiltersMap: { A: true },
        },
        c: {
          hasOptimisticUpdates: true,
          activeFiltersMap: {},
          amountOfResults: 10,
        },
        d: {
          hasOptimisticUpdates: false,
          activeFiltersMap: {},
          amountOfResults: 10,
        },
      });

      flush();

      expect(searchService.search$).toHaveBeenCalledTimes(2);
      expect(searchService.search$.mock.calls[1][0]).toMatchObject({
        activeFiltersMap: {},
        amountOfResults: 10,
      });
    });
  });

  it('should clear the optimistic updates if the request fails', () => {
    /**
     * requestOptions$: a---
     * search$:         -a|         -#
     * stateUpdate$:    --abc
     * state$:          -abcd 199ms -a
     */
    scheduler.run(({ expectObservable, cold, hot, flush }) => {
      /* tslint:disable-next-line */
      searchStateService['requestOptions$'] = hot('a', {
        a: {},
      });

      searchService.search$
        .mockReturnValueOnce(
          cold('-a|', {
            a: {
              hasOptimisticUpdates: false,
              activeFiltersMap: {},
              filters: [],
              amountOfResults: 0,
            },
          })
        )
        .mockReturnValueOnce(cold('-#'));

      /* tslint:disable-next-line */
      searchStateService['stateUpdate$'] = hot('--abc', {
        a: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'A',
        } as SearchStateActionUnion,
        b: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'B',
        } as SearchStateActionUnion,
        c: {
          type: StateUpdateType.ACTIVATE_FILTER,
          payload: 'C',
        } as SearchStateActionUnion,
      });

      searchStateService.init();

      expectObservable(searchStateService.state$).toBe('-abcd 199ms -a', {
        a: {
          hasOptimisticUpdates: false,
          activeFiltersMap: {},
        },
        b: {
          hasOptimisticUpdates: true,
          activeFiltersMap: { A: true },
        },
        c: {
          hasOptimisticUpdates: true,
          activeFiltersMap: { A: true, B: true },
        },
        d: {
          hasOptimisticUpdates: true,
          activeFiltersMap: { A: true, B: true, C: true },
        },
      });

      flush();

      expect(searchService.search$).toHaveBeenCalledTimes(2);
    });
  });
});
