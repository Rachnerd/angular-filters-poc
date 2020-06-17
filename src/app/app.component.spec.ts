/* tslint:disable:no-unused-variable */

import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SearchStateService } from './filters/search-state.service';
import { FiltersComponent } from './filters/filters.component';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, FiltersComponent],
      providers: [SearchStateService],
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
