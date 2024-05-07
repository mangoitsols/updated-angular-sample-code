import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitText',
})
export class LimitTextPipe implements PipeTransform {
  transform(value: string, args: string, trail?: string): unknown {
    const limit: number = args ? parseInt(args, 10) : 10;

    return value.length > limit ? value.substring(0, limit) + (trail === undefined ? '...' : '') : value;
  }
}
