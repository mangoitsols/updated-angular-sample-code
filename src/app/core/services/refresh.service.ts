import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private refreshSubject = new Subject<void>();

  constructor() {
    window.addEventListener('beforeunload', () => {
      // Emit a refresh event
      this.refreshSubject.next();
    });
  }

  // Method to subscribe to refresh events
  onRefresh(): Observable<void> {
    return this.refreshSubject.asObservable();
  }
}
