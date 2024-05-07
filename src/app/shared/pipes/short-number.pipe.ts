import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: number): any {
    if (!value || isNaN(value) || value === 0) {
      return 0;
    }

    const isNegative = value < 0;
    let absValue = Math.abs(value);

    const rounder = Math.pow(10, 1);
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 },
    ];

    for (const power of powers) {
      const reduced = absValue / power.value;
      if (reduced >= 1) {
        absValue = Math.round(reduced * rounder) / rounder;
        key = power.key;
        break;
      }
    }

    return `${isNegative ? '-' : ''}${absValue}${key}`;
  }
}
