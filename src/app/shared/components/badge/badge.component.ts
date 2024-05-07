import { AfterViewInit, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vc-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})

/**
 * Badge component provides a customizable badge tailored for enhanced usability and flexibility.
 * Features:
 * - **Display Customization**: Allows the user to set the displayed text and color for the badge.
 * - **Custom Styling**: Allows the user to set custom styles for the badge with classes or inline styles.
 * - **Custom Width**: Allows the user to set custom width for the badge.
 * - **Custom Height**: Allows the user to set custom height for the badge.
 * - **Custom Inline Style**: Allows the user to set custom inline style for the badge.
 * - **Custom Color**: Allows the user to set custom color for the badge.
 * - **Custom Background Color**: Allows the user to set custom background color for the badge.
 * - **Custom Border Color**: Allows the user to set custom border color for the badge.
 * - **Custom Font Size**: Allows the user to set custom font size for the badge.
 * - **Custom Text**: Allows the user to set custom text for the badge.
 *
 * @property {string} text - Text to display in the badge.
 * @property {string} color - Color of the badge.
 * @property {string} backgroundColor - Background color of the badge.
 * @property {string} borderColor - Border color of the badge.
 * @property {string} fontSize - Font size of the badge.
 * @property {string} width - Width of the badge.
 * @property {string} height - Height of the badge.
 * @property {string} positionTop - Position Top of the badge.
 * @property {string} positionLeft - Position Left of the badge.
 * @property {string} positionRight - Position Right of the badge.
 * @property {string} positionBottom - Position Bottom of the badge.
 * @property {Object} cssStyle - Inline style object.
 *
 * @example
 * <vc-badge text="New" color="#FFFFFF" backgroundColor="#FBC52D" borderColor="none" fontSize="9px" width="auto" height="auto" positionTop="none" positionLeft="none" positionRight="none" positionBottom="none" cssStyle="none"></vc-badge>
 */
export class BadgeComponent implements AfterViewInit {
  /**
   * Text to display in the badge.
   * default is empty string
   */
  @Input() isDateBadge = false;
  @Input() fullDate: string;
  @Input() text: string;
  dateText: { month: string; day: number };

  /**
   * Give radius to the specific edge of the badge.
   * default is empty string
   */
  @Input() borderTopLeftRadius: string;
  @Input() borderTopRightRadius: string;
  @Input() borderBottomLeftRadius: string;
  @Input() borderBottomRightRadius: string;

  /**
   * Color of the badge.
   * default #FFFFFF (white)
   */
  @Input() color: string;
  /**
   * Background color of the badge.
   * default #FBC52D (yellow)
   */
  @Input() backgroundColor: string;

  /**
   * Border color of the badge.
   * default none (none)
   */
  @Input() borderColor: string;

  /**
   * Font size of the badge.
   * default 9px
   */
  @Input() fontSize: string;

  /**
   * Width of the badge.
   * default auto
   */
  @Input() width: string;

  /**
   * Height of the badge.
   * default auto
   */
  @Input() height: string;

  /**
   * Position Top of the badge.
   * default none
   * If positionTop is set, position of badge will be set to absolute
   */
  @Input() positionTop: string;

  /**
   * Position Left of the badge.
   * default none
   * If positionLeft is set, position of badge will be set to absolute
   */
  @Input() positionLeft: string;

  /**
   * Position Right of the badge.
   * default none
   * If positionRight is set, position of badge will be set to absolute
   */
  @Input() positionRight: string;

  /**
   * Position Bottom of the badge.
   * default none
   * If positionBottom is set, position of badge will be set to absolute
   */
  @Input() positionBottom: string;

  /**
   * Inline style object.
   * Pass style object as is.
   * Example: { 'margin-right': '10px' } or { 'marginRight': '10px', 'marginLeft': '10px' }
   */
  @Input() cssStyle: { [key: string]: string };

  constructor() {}

  get positionStyle(): string {
    return this.positionTop || this.positionLeft || this.positionRight || this.positionBottom ? 'absolute' : '';
  }

  ngAfterViewInit(): void {
    this.setDateBadge();
  }

  setDateBadge() {
    if (this.isDateBadge) {
      const date = new Date(this.fullDate);
      const month = date.toLocaleString('default', { month: 'long' });
      const day = date.getDate();
      this.dateText = { month, day };
    }
  }
}
