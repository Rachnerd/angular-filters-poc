export interface Filter {
  value: string;
  lookupValue: string;
  children: Filter[];
}

export interface HashMap<T> {
  [key: string]: T;
}
