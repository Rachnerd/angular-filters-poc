import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Filter } from "./filters.model";

@Component({
  selector: "app-filters",
  templateUrl: "./filters.component.html",
  styleUrls: ["./filters.component.scss"],
})
export class FiltersComponent implements OnInit {
  @Input()
  filters: Filter[];

  @Output()
  activate = new EventEmitter<Filter>();

  @Output()
  deactivate = new EventEmitter<Filter>();

  activeParentFilterLookupValue: string;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    console.log("Change");
    console.log(this.filters);
  }

  toggleParentFilter(filter: Filter) {
    this.activeParentFilterLookupValue =
      this.activeParentFilterLookupValue === filter.lookupValue
        ? undefined
        : filter.lookupValue;
  }

  toggleFilter(filter: Filter) {
    // Break the reference to prevent 2-way bind side effects
    const event = Object.assign({}, filter);
    if (filter.active) {
      this.deactivate.next(event);
    } else {
      this.activate.next(event);
    }
  }

  trackByFilter(_index: number, filter: Filter) {
    console.log(`${filter.lookupValue}:${filter.active}`);
    return `${filter.lookupValue}:${filter.active}`;
  }
}
