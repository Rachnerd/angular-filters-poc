import {
  SearchState,
  SearchStateActionUnion,
  SearchStateUpdate,
  StateUpdateType,
} from './filters.model';

export const EMPTY_SEARCH_STATE_UPDATE: SearchStateUpdate = {
  activeFiltersMap: {},
  amountOfResults: undefined,
};

/**
 * Reducer that applies update actions to a SearchStateUpdate object.
 */
export function searchStateReducer(
  queuedUpdates: SearchStateUpdate,
  action: SearchStateActionUnion
): SearchStateUpdate {
  if (action.type === StateUpdateType.RESET) {
    return EMPTY_SEARCH_STATE_UPDATE;
  }

  if (action.type === StateUpdateType.AMOUNT_OF_RESULTS) {
    return {
      ...queuedUpdates,
      amountOfResults: action.payload,
    };
  }

  const { activeFiltersMap } = queuedUpdates;

  if (
    action.type === StateUpdateType.ACTIVATE_FILTER ||
    action.type === StateUpdateType.DEACTIVATE_FILTER
  ) {
    const activate = action.type === StateUpdateType.ACTIVATE_FILTER;
    if (activeFiltersMap[action.payload] === !activate) {
      // Cancel opposite queued update.
      delete activeFiltersMap[action.payload];
      return {
        ...queuedUpdates,
        activeFiltersMap,
      };
    } else {
      // Add to queued updates.
      return {
        ...queuedUpdates,
        activeFiltersMap: {
          ...activeFiltersMap,
          [action.payload]: activate,
        },
      };
    }
  } else {
    throw Error(`Uncaught action type passed ${action.type}`);
  }
}

/**
 * Merge state with state updates.
 */

export function applySearchStateUpdate(
  state: SearchState,
  update: SearchStateUpdate
): SearchState {
  const newState: SearchState = {
    hasOptimisticUpdates: undefined,
    activeFiltersMap: {
      ...state.activeFiltersMap,
      ...update.activeFiltersMap,
    },
    amountOfResults: update.amountOfResults || state.amountOfResults,
    filters: state.filters,
  };
  newState.hasOptimisticUpdates =
    stateToString(newState) !== stateToString(state);
  return newState;
}

function stateToString({
  amountOfResults,
  activeFiltersMap,
}: SearchStateUpdate) {
  return `amount:${amountOfResults};activeFilters:${Object.keys(
    activeFiltersMap
  )
    .map((key) => `${key}:${activeFiltersMap[key]}`)
    .join(',')};`;
}
