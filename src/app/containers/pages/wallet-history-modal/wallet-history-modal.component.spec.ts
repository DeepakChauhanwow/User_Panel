import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WalletHistoryModalComponent } from './wallet-history-modal.component';

describe('WalletHistoryModalComponent', () => {
  let component: WalletHistoryModalComponent;
  let fixture: ComponentFixture<WalletHistoryModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletHistoryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
