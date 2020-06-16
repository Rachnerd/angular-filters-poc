import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SERVER_SIDE_FILTERS } from './search.response';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  /**
   * Perform the HTTP request.
   */
  search$(request) {
    return of(request).pipe(
      delay(100),
      map((response) => {
        if (
          response.activeFiltersMap['fail-to-activate'] ||
          response.activeFiltersMap['fail-to-deactivate'] === false
        ) {
          throw Error();
        }
        return {
          hasOptimisticUpdates: false,
          activeFiltersMap: response.activeFiltersMap,
          filters: SERVER_SIDE_FILTERS,
          amountOfResults: response.amountOfResults,
        };
      })
    );
  }
}
