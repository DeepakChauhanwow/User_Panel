import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HistoryModalComponent } from './history-modal.component';

describe('HistoryModalComponent', () => {
  let component: HistoryModalComponent;
  let fixture: ComponentFixture<HistoryModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
