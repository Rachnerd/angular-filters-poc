export interface Filter {
  value: string;
  lookupValue: string;
  children: Filter[];
  active: boolean;
}
