import {
  SearchStateActionUnion,
  SearchStateUpdate,
  StateUpdateType,
} from './filters.model';

export const EMPTY_SEARCH_STATE_UPDATE = {
  activeFiltersUpdateMap: {},
  amountOfResultsUpdate: undefined,
};

/**
 * Reducer that applies update actions to a SearchStateUpdate object.
 */
export function searchReducer(
  queuedUpdates: SearchStateUpdate,
  action: SearchStateActionUnion
): SearchStateUpdate {
  if (action.type === StateUpdateType.RESET) {
    return EMPTY_SEARCH_STATE_UPDATE;
  }

  if (action.type === StateUpdateType.AMOUNT_OF_RESULTS) {
    return {
      ...queuedUpdates,
      amountOfResultsUpdate: action.payload,
    };
  }

  const { activeFiltersUpdateMap } = queuedUpdates;

  if (
    action.type === StateUpdateType.ACTIVATE_FILTER ||
    action.type === StateUpdateType.DEACTIVATE_FILTER
  ) {
    const activate = action.type === StateUpdateType.ACTIVATE_FILTER;
    if (activeFiltersUpdateMap[action.payload] === !activate) {
      // Cancel opposite queued update.
      delete activeFiltersUpdateMap[action.payload];
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
          [action.payload]: activate,
        },
      };
    }
  } else {
    throw Error(`Uncaught action type passed ${action.type}`);
  }
}
