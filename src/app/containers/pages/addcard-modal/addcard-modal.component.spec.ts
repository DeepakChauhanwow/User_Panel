import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddcardModalComponent } from './addcard-modal.component';

describe('AddcardModalComponent', () => {
  let component: AddcardModalComponent;
  let fixture: ComponentFixture<AddcardModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddcardModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddcardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
