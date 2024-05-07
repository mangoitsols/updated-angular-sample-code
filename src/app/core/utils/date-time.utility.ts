import { LanguageService } from '@core/services';
import { inject } from '@angular/core';

export class DateTimeUtility {
  private _languageService = inject(LanguageService);
  private _language: any;

  constructor() {
    this._language = this._languageService.getLanguageFile();
  }

  /**
   * The function `getYears` returns an array of numbers representing the years between a start year and
   * an end year.
   * @param {number} startYear - The start year is the first year in the range of years you want to
   * generate.
   * @param {number} endYear - The `endYear` parameter represents the last year in the range of years you
   * want to generate.
   * @returns an array of numbers representing the years between the startYear and endYear (inclusive).
   */
  public getYears(startYear: number, endYear: number): number[] {
    const years = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(i);
    }
    return years;
  }

  /**
   * The function `getMonths` returns an array of objects containing the names and numbers of the months,
   * with the option to use language-specific month names if available.
   * @returns The function `getMonths()` returns an array of objects, where each object represents a
   * month. Each object has two properties: `name` and `number`. The `name` property represents the name
   * of the month, and the `number` property represents the number of the month (1 for January, 2 for
   * February, and so on).
   */
  public getMonths(): { name: string; number: number }[] {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const name = new Date(0, i).toLocaleString('en', { month: 'long' });
      const langMonthName = this._language?.club_events[name.toLowerCase()];
      months.push({
        name: langMonthName ?? name,
        number: i + 1,
      });
    }
    return months;
  }

  /**
   * The function `getDays` returns an array of numbers representing the days of a given month and year,
   * with the current day marked as "Current".
   * @param {number} [month] - The `month` parameter is an optional number that represents the month. If
   * not provided, it defaults to the current month.
   * @param {number} [year] - The `year` parameter is an optional number that represents the year for
   * which you want to get the days. If no value is provided, it defaults to the current year.
   * @param keyValue - The `keyValue` parameter is an optional boolean that determines whether the array returned is number or key value pair.
   * @returns an array of numbers or strings representing the days of the specified month and year.
   */
  public getDays(month?: number, year?: number, keyValue = false): (number | string | { name: string; number: number })[] {
    const now = new Date();
    month = month ?? now.getMonth(); // 0-indexed
    year = year ?? now.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray: (number | string | { name: string; number: number })[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === now.getDate() && month === now.getMonth() && year === now.getFullYear();

      if (keyValue) {
        const dayObj = {
          name: isToday ? this._language?.club_events.current || 'Current' : i.toString(),
          number: i,
        };
        daysArray.push(dayObj);
      } else {
        if (isToday) {
          daysArray.push(this._language?.club_events.current || 'Current');
        } else {
          daysArray.push(i);
        }
      }
    }
    return daysArray;
  }

  public getDay(date: string): string {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    return `${day}`;
  }

  public getMonth(date: string): string {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    return new Date(0, month).toLocaleString('en', { month: 'long' });
  }
}
