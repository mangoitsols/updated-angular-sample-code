import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IconService } from '@core/services';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'vc-icon',
  template: '',
})
export class IconComponent implements OnInit {
  /**
   * Color of the icon.
   * default #BDBDBD (grey)
   * Applied directly to the SVG element.
   *
   * Example: '#BDBDBD' | 'red' | 'rgb(255, 0, 0)' | 'var(--color-primary)'
   */
  @Input() color: string;

  /**
   * Size of the icon in pixels.
   * default 16px
   * Applied directly to the SVG element.
   *
   * Example: '16px'
   */
  @Input() size = '16px';

  /**
   * Size of the icon box in pixels.
   * default is 10px more than the icon size (16px + 10px = 26px)
   *
   * Applied to the svg parent, span element, only if showBorder is true.
   *
   * Example: '26px'
   */
  @Input() boxSize: string;

  /**
   * CSS style object.
   * Pass style object as is.
   *
   * Applied to the svg parent, span element.
   *
   * Example: { 'margin-right': '10px' }
   */
  @Input() cssStyle: { [key: string]: string };
  /**
   * CSS class name.
   * Pass class name as string.
   *
   * Applied to the svg , span element.
   *
   * Example: 'margin-right-10' or 'mr-5'
   */
  @Input() cssClass: string;

  /**
   * Show border around the icon.
   *
   * Default false
   * Applied to the svg parent, span element.
   *
   * Example: true
   */
  @Input() showBorder = false;

  /**
   * Background color of the icon.
   * default transparent
   * Applied to the svg parent, span element.
   */
  @Input() backgroundColor: string;

  /**
   * Set given size of icon to span.
   */
  @Input() planIcon = false;

  private spanElement: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2, private _iconService: IconService) {}

  private _iconName: string;

  /**
   * Name of the icon file without extension.
   * Only SVGs are supported.
   *
   * Available icons are in assets/icons folder.
   *
   * Icons Names List:
   *  - action-button
   *  - add-event
   *  - calendar
   *  - chevron-down
   *  - chevron-right
   *  - chevron-up
   *  - delete
   *  - delete-icon
   *  - edit
   *  - feature-locked
   *  - location
   *  - message
   *  - news
   *  - pencil
   *  - send
   *  - share
   *  - task
   *  - team
   *  - team-remove
   *  - users
   *  - vertical-ellipsis
   *  - watch
   *
   */
  @Input()
  get iconName(): string {
    if (!this._iconName) {
      throw new Error('Attribute "iconName" is required');
    }
    return this._iconName;
  }

  set iconName(value: string) {
    this._iconName = value;
    this.loadIcon();
  }

  ngOnInit(): void {
    this.initSpanElement();
    if (this._iconName) {
      this.loadIcon();
    }
  }

  private loadIcon(): void {
    if (!this._iconName || !this.spanElement) {
      return;
    }
    this._iconService
      .get(this._iconName)
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        if (data) {
          this.renderer.setProperty(this.spanElement, 'innerHTML', data);
          const svgElement = this.spanElement.querySelector('svg');

          // to center the icon vertically and horizontally inside of span
          this.renderer.setStyle(svgElement, 'position', 'absolute');
          this.renderer.setStyle(svgElement, 'top', '50%');
          this.renderer.setStyle(svgElement, 'left', '50%');
          this.renderer.setStyle(svgElement, 'transform', 'translate(-50%, -50%)');

          if (this.color) {
            const pathElements = svgElement.querySelectorAll('path');
            pathElements.forEach(pathElement => {
              // If the path has a stroke, set the stroke color to match the path color
              if (pathElement.getAttribute('stroke')) {
                this.renderer.setAttribute(pathElement, 'stroke', this.color);
              } else {
                this.renderer.setAttribute(pathElement, 'fill', this.color);
              }
            });
          }

          // If showBorder is true, set the border color to match the path color
          if (this.showBorder) {
            this.renderer.setStyle(this.spanElement, 'padding', '2px');
            this.renderer.setStyle(this.spanElement, 'border-radius', '5px');
            this.renderer.setStyle(this.spanElement, 'border', `1px solid ${this.color ? this.color : '#BDBDBD'}`);
          }

          if (this.backgroundColor) {
            this.renderer.setStyle(this.spanElement, 'background-color', this.backgroundColor);
            this.renderer.setStyle(this.spanElement, 'border-radius', '5px');
          }

          if (this.size) {
            this.renderer.setAttribute(svgElement, 'width', this.size);
            this.renderer.setAttribute(svgElement, 'height', this.size);
          }

          if (this.boxSize) {
            if (this.showBorder) {
              this.renderer.setStyle(this.spanElement, 'height', this.boxSize);
              this.renderer.setStyle(this.spanElement, 'width', this.boxSize);
            }
          }

          if (this.cssStyle) {
            Object.keys(this.cssStyle).forEach(key => {
              this.renderer.setStyle(this.spanElement, key, this.cssStyle[key]);
            });
          }

          if (this.cssClass) {
            this.renderer.setAttribute(this.spanElement, 'class', this.cssClass);
          }
        }
      });
  }

  private initSpanElement(): void {
    if (!this._iconName) {
      return;
    }

    this.spanElement = this.renderer.createElement('span');
    this.renderer.appendChild(this.el.nativeElement, this.spanElement);
    this.renderer.setStyle(this.spanElement, 'display', 'inline-block');
    this.renderer.setStyle(this.spanElement, 'height', this.planIcon ? this.size : this.size ? `${parseInt(this.size, 10) + 10}px` : '23px');
    this.renderer.setStyle(this.spanElement, 'width', this.planIcon ? this.size : this.size ? `${parseInt(this.size, 10) + 10}px` : '23px');
    this.renderer.setStyle(this.spanElement, 'position', 'relative');
  }
}
