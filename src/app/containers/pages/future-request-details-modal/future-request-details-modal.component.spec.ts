import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FutureRequestDetailsModalComponent } from './future-request-details-modal.component';

describe('FutureRequestDetailsModalComponent', () => {
  let component: FutureRequestDetailsModalComponent;
  let fixture: ComponentFixture<FutureRequestDetailsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureRequestDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureRequestDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
