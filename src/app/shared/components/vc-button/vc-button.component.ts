import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vc-button',
  templateUrl: './vc-button.component.html',
  styleUrls: ['./vc-button.component.scss'],
})
export class VcButtonComponent implements OnInit {
  @Input() label: string;
  @Input() borderTopLeftRadius: string;
  @Input() borderTopRightRadius: string;
  @Input() borderBottomLeftRadius: string;
  @Input() borderBottomRightRadius: string;
  @Input() disabled: boolean;

  /**
   * Color of the badge.
   * default #FFFFFF (white)
   */
  @Input() border: string;

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
  @Input() inlineStyle: { [key: string]: string };

  constructor() {}

  get positionStyle(): string {
    return this.positionTop || this.positionLeft || this.positionRight || this.positionBottom ? 'absolute' : '';
  }

  ngOnInit(): void {}
}
