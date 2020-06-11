import { Component } from '@angular/core';
import { Filter, HashMap } from './filters/filters.model';
import { SearchService } from './filters/search.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  filters$: Observable<Filter[]>;

  /**
   * Combination of processed and unprocessed filters.
   */
  activeFilters$: Observable<HashMap<boolean>>;

  constructor(private searchService: SearchService) {
    this.filters$ = this.searchService.filters$;
    this.activeFilters$ = this.searchService.activeFiltersState;
  }

  activateFilter(filter: Filter) {
    console.log('Activate');
    this.searchService.activateFilter(filter);
  }

  deactivateFilter(filter: Filter) {
    console.log('Deactivate');
    this.searchService.deactivateFilter(filter);
  }
}
