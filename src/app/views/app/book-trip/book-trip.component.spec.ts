import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BookTripComponent } from './book-trip.component';

describe('BookTripComponent', () => {
  let component: BookTripComponent;
  let fixture: ComponentFixture<BookTripComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BookTripComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
