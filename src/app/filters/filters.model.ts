export interface Filter {
  value: string;
  lookupValue: string;
  children: Filter[];
}

export interface HashMap<T> {
  [key: string]: T;
}

export type ActiveFiltersMap = HashMap<boolean>;

export interface SearchState {
  filters: Filter[];
  activeFiltersMap: ActiveFiltersMap;
  hasOptimisticUpdates: boolean;
  amountOfResults?: number;
}

export interface SearchStateUpdate {
  activeFiltersUpdateMap: ActiveFiltersMap;
  amountOfResultsUpdate: number;
}

export enum StateUpdateType {
  ACTIVATE_FILTER,
  DEACTIVATE_FILTER,
  AMOUNT_OF_RESULTS,
  RESET,
}

export interface SearchStateUpdateEvent<T, P> {
  type: T;
  payload: P;
}

type ResetSearchStateEvent = SearchStateUpdateEvent<
  StateUpdateType.RESET,
  void
>;
type ChangeFilterSearchStateEvent = SearchStateUpdateEvent<
  StateUpdateType.ACTIVATE_FILTER | StateUpdateType.DEACTIVATE_FILTER,
  string
>;

type ChangeAmountOfResultsSearchStateEvent = SearchStateUpdateEvent<
  StateUpdateType.AMOUNT_OF_RESULTS,
  number
>;

export type SearchStateUpdateEventUnion =
  | ResetSearchStateEvent
  | ChangeFilterSearchStateEvent
  | ChangeAmountOfResultsSearchStateEvent;
