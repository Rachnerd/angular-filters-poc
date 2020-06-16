import { Component } from '@angular/core';
import { Filter, SearchState } from './filters/filters.model';
import { SearchService } from './filters/search.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  filtersState$: Observable<SearchState>;
  printState$: Observable<any>;

  constructor(private searchService: SearchService) {
    this.filtersState$ = this.searchService.state$;
    this.printState$ = this.filtersState$.pipe(
      map((state) => ({
        activeFiltersMap: state.activeFiltersMap,
        hasOptimisticUpdates: state.hasOptimisticUpdates,
        amountOfResults: state.amountOfResults,
      }))
    );
  }

  ngAfterViewInit() {
    this.searchService.search();

    setTimeout(() => {
      this.searchService.loadResults(10);
    }, 2000);
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
