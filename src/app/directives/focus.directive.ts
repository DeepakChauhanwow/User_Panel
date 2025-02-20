import { Directive, HostListener, ElementRef, Optional, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { FormArray, FormGroupDirective, NgForm } from '@angular/forms';

@Directive({
  selector: '[appFocus]',
})
export class InputFocusDirective {
  isArray: boolean = false;
  @ViewChildren('inputElements') inputElements: QueryList<ElementRef>;
  constructor(private el: ElementRef, private renderer: Renderer2, @Optional() private ngForm: NgForm, @Optional() private formGroupDirective: FormGroupDirective) { }

  @HostListener('document:click', ['$event.target'])
  //   @HostListener('document:click', ['$event.target.parentNode'])
  onClick(target: any) {
    if ((target.type === 'submit' || target.type === 'button') || (target.parentNode && (target.parentNode.type === 'submit' || target.parentNode.type === 'button'))) {
      let form: any = null;
      let formType;
      if (this.ngForm) {
        form = this.ngForm;
        formType = 1;
      } else if (this.formGroupDirective) {
        form = this.formGroupDirective.form;
        formType = 2;
      }

      if (form && !form.valid) {
        const firstInvalidControl = this.getFirstInvalidControl(form);
        if (formType == 1) {
          if (firstInvalidControl) {
            const invalidControlElement = this.el.nativeElement.querySelector(`[name="${firstInvalidControl}"]`);

            if (invalidControlElement) {
              invalidControlElement.focus();
              if (invalidControlElement.tagName === 'NG-SELECT') {
                this.renderer.addClass(invalidControlElement, 'ng-select-opened');
              }
            }
          }
        } else if (firstInvalidControl && !this.isArray) {
          const invalidControlElement = this.el.nativeElement.querySelector(`[formControlName="${firstInvalidControl}"]`);
          if (invalidControlElement) {
            invalidControlElement.focus();
            if (invalidControlElement.tagName === 'NG-SELECT') {
              this.renderer.addClass(invalidControlElement, 'ng-select-opened');
            }
          }
        }

        if (formType == 2 && this.isArray) {
          if (firstInvalidControl) {
            const invalidControlElement = this.el.nativeElement.querySelector(`[id="${firstInvalidControl}"]`);
            if (invalidControlElement) {
              invalidControlElement.focus();
            }
          }
        }
      }
    }
  }

  private getFirstInvalidControl(form: any): string | null {
    const controls = form.controls;

    for (const controlName in controls) {
      const control = controls[controlName];

      if (control instanceof FormArray) {
        for (const arrayControlName in control.controls) {
          if (control.controls[arrayControlName].invalid) {
            this.isArray = true;
            return arrayControlName;
          }
        }
      }

      if (control.invalid) {
        this.isArray = false;
        return controlName;
      }
    }
    return null;
  }
}
