import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'vc-tabs-selection',
  templateUrl: './tabs-selection.component.html',
  styleUrls: ['./tabs-selection.component.scss'],
})

/**
 * This component is used to display a list of tabs and emit the selected tab.
 * Also, it supports routing to the selected tab if the routerLink is provided.
 * Support color customization for the active tab.
 * @property tabs: { label: string; routerLink?: string }[] - The list of tabs to display
 * @property activeTabBgColor: string - The background color of the active tab
 * @property activeTabTextColor: string - The text color of the active tab
 * @event selectedTab: EventEmitter<string> - The selected tab
 *
 * @example <vc-tabs-selection [tabs]="tabs" (selectedTab)="selectedTab($event)" activeTabBgColor="#FFFFFF" activeTabTextColor="#000000"></vc-tabs-selection>
 */
export class TabsSelectionComponent implements AfterViewInit, OnDestroy {
  /**
   * The list of tabs to display
   * @example [{ label: 'Tab 1', routerLink: '/tab1' }, { label: 'Tab 2', routerLink: '/tab2' }]
   */
  @Input() tabs: { label: string; routerLink?: string }[] = [];

  /**
   * Emits the selected tab
   */
  @Output() selectedTab: EventEmitter<string> = new EventEmitter<string>();
  /**
   * Sets the background color of the active tab
   */
  @Input() activeTabBgColor = 'var(--vc-color-yellow)';
  /**
   * Sets the text color of the active tab
   */
  @Input() activeTabTextColor = '#FFFFFF';
  activeTab = 0;

  private resizeListener: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: any) {}

  private _selectedTabName: string;
  /**
   * The name of the selected tab
   * @example 'tab 1'
   */
  @Input() set selectedTabName(tabName: string) {
    this._selectedTabName = tabName;
    this._setActiveTab();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeListener = this.renderer.listen(window, 'resize', () => {
        this._setActiveTab();
      });
    }
    this._setActiveTab();
  }

  selectTab(index: number) {
    const buttons = this.el.nativeElement.querySelectorAll('.tab');
    const bg = this.el.nativeElement.querySelector('.tab-slider-bg');
    const activeButton = buttons[index];

    if (!activeButton) {
      return;
    }
    // Reset all button text colors to default
    buttons.forEach((button: any) => (button.style.color = ''));

    // Set the width and position of the slider background
    bg.style.width = `${activeButton.offsetWidth}px`;
    bg.style.left = `${activeButton.offsetLeft}px`;
    bg.style.backgroundColor = this.activeTabBgColor; // set the background color from input

    // Set the text color for the active tab
    activeButton.style.color = this.activeTabTextColor;

    // Update active tab index
    this.activeTab = index;

    // Emit the selected tab
    this.selectedTab.emit(activeButton.innerText.toLowerCase());
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      this.resizeListener();
    }
  }

  private _setActiveTab(): void {
    if (this._selectedTabName) {
      const tabIndex = this.tabs.findIndex(tab => tab.label.toLowerCase() === this._selectedTabName.toLowerCase());
      if (tabIndex !== -1) {
        this.selectTab(tabIndex);
      }
    } else {
      this.selectTab(0);
    }
  }
}
