import {
  applySearchStateUpdate,
  EMPTY_SEARCH_STATE_UPDATE,
  searchStateReducer,
} from './search-state.reducer';
import { SearchStateActionUnion, StateUpdateType } from './filters.model';

describe('Search reducer', () => {
  function getState(actions: SearchStateActionUnion[]) {
    return actions.reduce(
      (state, action) => searchStateReducer(state, action),
      EMPTY_SEARCH_STATE_UPDATE
    );
  }

  describe('Activating/deactivating filters', () => {
    it('should activate a filter', () => {
      expect(
        getState([{ type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' }])
      ).toEqual({
        amountOfResults: undefined,
        activeFiltersMap: { A: true },
      });
    });

    it('should cancel filter activation if deactivated', () => {
      expect(
        getState([
          { type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' },
          { type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' },
        ])
      ).toEqual({
        activeFiltersMap: {},

        amountOfResults: undefined,
      });
    });

    it('should deactivate a filter', () => {
      expect(
        getState([{ type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' }])
      ).toEqual({
        activeFiltersMap: { A: false },
        amountOfResults: undefined,
      });
    });

    it('should cancel filter deactivate if activated', () => {
      expect(
        getState([
          { type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' },
          { type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' },
        ])
      ).toEqual({
        amountOfResults: undefined,
        activeFiltersMap: {},
      });
    });

    it('should activate a filter, reset and deactivate a filter', () => {
      expect(
        getState([
          { type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' },
          { type: StateUpdateType.RESET, payload: undefined },
          { type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' },
        ])
      ).toEqual({
        amountOfResults: undefined,
        activeFiltersMap: { A: false },
      });
    });
  });

  describe('Changing amount of results', () => {
    it('should change the amount of results', () => {
      expect(
        getState([{ type: StateUpdateType.AMOUNT_OF_RESULTS, payload: 10 }])
      ).toEqual({
        amountOfResults: 10,
        activeFiltersMap: {},
      });
    });
  });

  it('should reset state', () => {
    expect(
      getState([
        { type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' },
        { type: StateUpdateType.RESET, payload: undefined },
      ])
    ).toEqual(EMPTY_SEARCH_STATE_UPDATE);
  });

  it('should throw an error if an uncaught action type is passed', () => {
    expect(() => getState([{ type: 'error' as any, payload: 'A' }])).toThrow();
  });

  describe('Applying the update to the state', () => {
    it('should apply the update', () => {
      expect(
        applySearchStateUpdate(
          {
            amountOfResults: undefined,
            hasOptimisticUpdates: false,
            activeFiltersMap: {},
            filters: [],
          },
          {
            amountOfResults: 1,
            activeFiltersMap: { A: true },
          }
        )
      ).toMatchObject({
        amountOfResults: 1,
        hasOptimisticUpdates: true,
        activeFiltersMap: { A: true },
      });
    });

    it('should detect if there are no changes in the result', () => {
      expect(
        applySearchStateUpdate(
          {
            amountOfResults: 1,
            hasOptimisticUpdates: false,
            activeFiltersMap: { A: true },
            filters: [],
          },
          {
            amountOfResults: 1,
            activeFiltersMap: { A: true },
          }
        )
      ).toMatchObject({
        amountOfResults: 1,
        hasOptimisticUpdates: false,
        activeFiltersMap: { A: true },
      });
    });
  });
});
