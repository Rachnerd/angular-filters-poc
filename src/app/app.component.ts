import { Component } from "@angular/core";
import { Filter } from "./filters/filters.model";

interface Normalized<T> {
  [lookupValue: string]: T;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "app works!";

  filters: Filter[];

  filtersNormalized: Normalized<Filter>;

  constructor() {
    this.resetFilters();
  }

  activateFilter(filter: Filter) {
    console.log("Activate", filter);

    setTimeout(() => {
      this.resetFilters();
    }, 200);
  }

  deactivateFilter(filter: Filter) {
    console.log("Deactivate", filter);

    setTimeout(() => {
      this.resetFilters();
    }, 200);
  }

  private resetFilters() {
    this.filters = [
      {
        value: "Parent1",
        active: false,
        lookupValue: "parent1",
        children: [
          {
            value: "Parent1Child1",
            active: true,
            lookupValue: "parent1child1",
            children: [],
          },
          {
            value: "Parent1Child2",
            active: false,
            lookupValue: "parent1child2",
            children: [],
          },
        ],
      },
      {
        value: "Parent2",
        active: false,
        lookupValue: "parent2",
        children: [
          {
            value: "Parent2Child1",
            active: false,
            lookupValue: "parent2child1",
            children: [],
          },
        ],
      },
    ];

    // this.filtersNormalized = normalize(this.filters, "lookupValue");

    console.log(this.filtersNormalized);
  }
}

function normalize<T>(collection: T[], id: keyof T): Normalized<T> {
  return collection.reduce(
    (acc, obj) => ({
      ...acc,
      ["123"]: obj,
    }),
    {}
  ) as Normalized<T>;
}
