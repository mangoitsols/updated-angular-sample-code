import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directive to set default image if the image is not loaded
 * Can also pass the default image path as an input
 * @example
 * <img [src]="imagePath" appDefaultImage />
 * @example
 * <img [src]="imagePath" appDefaultImage="assets/images/no-image.png" />
 */
@Directive({
  selector: 'img[appDefaultImage]',
  standalone: true,
})
export class DefaultImageDirective {
  // Optional input to override the default image path
  @Input('vcDefaultImage') customDefaultImg: string;

  // Default image path fallback
  private readonly _defaultImg: string = 'assets/img/no-image.png';

  constructor(private readonly _el: ElementRef<HTMLImageElement>) {}

  // If the image fails to load, set the default image
  @HostListener('error') onError() {
    const element: HTMLImageElement = this._el.nativeElement;

    // Use the custom default image if provided, else fallback to _defaultImg
    element.src = this.customDefaultImg || this._defaultImg;
  }

  // Prevent right-click on the image
  @HostListener('contextmenu', ['$event']) onRightClick(event: MouseEvent) {
    event.preventDefault();
  }
}
