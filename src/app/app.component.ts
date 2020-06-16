import { Component } from '@angular/core';
import { Filter, SearchState } from './filters/filters.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchStateService } from './filters/search-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  filtersState$: Observable<SearchState>;
  printState$: Observable<any>;

  constructor(private searchStateService: SearchStateService) {
    this.filtersState$ = this.searchStateService.state$;
    this.printState$ = this.filtersState$.pipe(
      map((state) => ({
        activeFiltersMap: state.activeFiltersMap,
        hasOptimisticUpdates: state.hasOptimisticUpdates,
        amountOfResults: state.amountOfResults,
      }))
    );
  }

  ngAfterViewInit() {
    this.searchStateService.search();

    setTimeout(() => {
      this.searchStateService.loadResults(10);
    }, 2000);
  }

  activateFilter(filter: Filter) {
    console.log('Activate');
    this.searchStateService.activateFilter(filter);
  }

  deactivateFilter(filter: Filter) {
    console.log('Deactivate');
    this.searchStateService.deactivateFilter(filter);
  }
}
