import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  private dropdownValueSubject = new BehaviorSubject<string>(''); // Initial value

  constructor() {}

  // Method to update the dropdown value
  updateDropdownValue(value: string) {
    this.dropdownValueSubject.next(value);
  }

  // Method to get the current dropdown value
  getDropdownValue() {
    return this.dropdownValueSubject.asObservable();
  }
}
