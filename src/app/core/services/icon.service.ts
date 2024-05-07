import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, shareReplay } from 'rxjs/operators';
import { Cacheable } from '@core/helpers';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(private http: HttpClient) {}

  /**
   * TO BE USED IN THE ICON COMPONENT
   * The function `get` retrieves an SVG icon from the cache or makes an HTTP request to fetch it if it
   * is not already cached.
   * @param {string} name - The `name` parameter is a string that represents the name of the icon that
   * you want to retrieve.
   * @returns The `get` method returns an `Observable<string>`.
   */

  @Cacheable('getIcon', { maxSize: 150 })
  get(name: string): Observable<string> {
    return this.http.get(`assets/icons/${name}.svg`, { responseType: 'text' }).pipe(
      shareReplay(1),
      catchError(err => {
        console.error(`Error loading icon: ${name}`, err);
        return of('');
      })
    );
  }

  // ------------------------------------------------------------
  // The following code is an alternative to the `get` method above.
  // It uses a private cache to store the icons.
  // ------------------------------------------------------------

  // private cache: Map<string, Observable<string>> = new Map();

  // get(name: string): Observable<string> {
  //   if (!this.cache.has(name)) {
  //     const obs = this.http.get(`assets/icons/${name}.svg`, { responseType: 'text' }).pipe(
  //       shareReplay(1),
  //       catchError(err => {
  //         console.error(`Error loading icon: ${name}`, err);
  //         return of('');
  //       })
  //     );
  //     this.cache.set(name, obs);
  //   }
  //   return this.cache.get(name);
  // }
}
