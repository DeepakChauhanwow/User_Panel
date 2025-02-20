import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFocusDirective } from './focus.directive';

@NgModule({
  declarations: [InputFocusDirective],
  imports: [
    CommonModule
  ],
  exports: [
    InputFocusDirective
  ]
})
export class DirectivesModule { }
