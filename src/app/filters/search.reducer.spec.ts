import { EMPTY_SEARCH_STATE_UPDATE, searchReducer } from './search.reducer';
import { SearchStateActionUnion, StateUpdateType } from './filters.model';

describe('Search reducer', () => {
  function getState(actions: SearchStateActionUnion[]) {
    return actions.reduce(
      (state, action) => searchReducer(state, action),
      EMPTY_SEARCH_STATE_UPDATE
    );
  }

  describe('Activating/deactivating filters', () => {
    it('should activate a filter', () => {
      expect(
        getState([{ type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' }])
      ).toEqual({
        activeFiltersUpdateMap: { A: true },
        amountOfResultsUpdate: undefined,
      });
    });

    it('should cancel filter activation if deactivated', () => {
      expect(
        getState([
          { type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' },
          { type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' },
        ])
      ).toEqual({
        activeFiltersUpdateMap: {},
        amountOfResultsUpdate: undefined,
      });
    });

    it('should deactivate a filter', () => {
      expect(
        getState([{ type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' }])
      ).toEqual({
        activeFiltersUpdateMap: { A: false },
        amountOfResultsUpdate: undefined,
      });
    });

    it('should cancel filter deactivate if activated', () => {
      expect(
        getState([
          { type: StateUpdateType.DEACTIVATE_FILTER, payload: 'A' },
          { type: StateUpdateType.ACTIVATE_FILTER, payload: 'A' },
        ])
      ).toEqual({
        activeFiltersUpdateMap: {},
        amountOfResultsUpdate: undefined,
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
        activeFiltersUpdateMap: { A: false },
        amountOfResultsUpdate: undefined,
      });
    });
  });

  describe('Changing amount of results', () => {
    it('should change the amount of results', () => {
      expect(
        getState([{ type: StateUpdateType.AMOUNT_OF_RESULTS, payload: 10 }])
      ).toEqual({
        activeFiltersUpdateMap: {},
        amountOfResultsUpdate: 10,
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
});
