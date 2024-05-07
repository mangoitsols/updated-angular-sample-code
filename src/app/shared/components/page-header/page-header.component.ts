import {Component, Input} from '@angular/core';
import {BreadcrumbItem} from '@shared/components/page-header/breadcrumb.type';

@Component({
  selector: 'vc-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})

/**
 * Page header component.
 * Displays page header title and breadcrumbs.
 * Content project is used to display any content on the right side of the page header.
 * Breadcrumbs are displayed below the page header title.
 *
 * @property {string} headerTitle - Page header title.
 * @property {BreadcrumbItem[]} breadcrumbs - Breadcrumb items.
 * @property {Object} headerTitleStyles - CSS style object. Pass style object as is. Applied to the page header title.
 * @property {Object} breadcrumbsStyles - CSS style object. Pass style object as is. Applied to the breadcrumbs container.
 * @property {string} cssClass - CSS class name. Pass class name as string. Applied to the page header parent div.
 *
 */
export class PageHeaderComponent {

  /**
   * Page header title
   */
  @Input() headerTitle: string;

  /**
   * Breadcrumb items
   * Show breadcrumbs below the page header title.
   * @Type {BreadcrumbItem[]}
   */
  @Input() breadcrumbs: BreadcrumbItem[] = [];

  /**
   * CSS style object.
   * Pass style object as is.
   *
   * Applied to the page header title.
   */
  @Input() headerTitleStyles: { [key: string]: string } = {};

  /**
   * CSS style object.
   * Pass style object as is.
   *
   * Applied to the breadcrumbs container.
   */
  @Input() breadcrumbsStyles: { [key: string]: string } = {};

  /**
   * CSS class name.
   * Pass class name as string.
   * Applied to the page header parent div.
   */
  @Input() cssClass: string;

  /**
   * Show back button.
   * NOT AVAILABLE YET
   */
  @Input() showBackButton = false;


}
