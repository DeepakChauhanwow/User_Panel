import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrivacyTermsComponent } from './privacy-terms.component';

describe('PrivacyTermsComponent', () => {
  let component: PrivacyTermsComponent;
  let fixture: ComponentFixture<PrivacyTermsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyTermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
