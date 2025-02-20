import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdinalPipe } from './ordinal.pipe'



@NgModule({
  declarations: [OrdinalPipe],
  imports: [CommonModule],
  exports: [OrdinalPipe],
})
export class PipeModule {}