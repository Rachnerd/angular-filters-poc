import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Filter, HashMap } from './filters.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {
  @Input()
  filters: Filter[];

  @Input()
  activeFilters: HashMap<boolean> = {};

  @Output()
  activate = new EventEmitter<Filter>();

  @Output()
  deactivate = new EventEmitter<Filter>();

  expandedParentFilterLookupValue: string;

  ngOnInit() {}

  /**
   * Internal state that determines which parent filter is open.
   */
  toggleParentFilter(filter: Filter) {
    this.expandedParentFilterLookupValue =
      this.expandedParentFilterLookupValue === filter.lookupValue
        ? undefined
        : filter.lookupValue;
  }

  /**
   * Events of the interaction with the filters.
   */
  toggleFilter(filter: Filter) {
    if (this.activeFilters[filter.lookupValue]) {
      this.deactivate.next(filter);
    } else {
      this.activate.next(filter);
    }
  }
}
