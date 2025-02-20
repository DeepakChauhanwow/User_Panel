import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegisterAddressModelComponent } from './register-address-model.component';

describe('RegisterAddressModelComponent', () => {
  let component: RegisterAddressModelComponent;
  let fixture: ComponentFixture<RegisterAddressModelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterAddressModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterAddressModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
