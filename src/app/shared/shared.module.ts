import { NgModule } from '@angular/core';

import { MenuItems } from './menu-items/menu-items';
import { CurrencyChangePipe } from '../pipes/currency-change.pipe';
import {
  AccordionAnchorDirective,
  AccordionLinkDirective,
  AccordionDirective
} from './accordion';

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    CurrencyChangePipe
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    CurrencyChangePipe
  ],
  providers: [MenuItems]
})
export class SharedModule {}
