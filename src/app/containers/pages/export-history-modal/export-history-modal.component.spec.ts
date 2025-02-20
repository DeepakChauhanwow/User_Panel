import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportHistoryModalComponent } from './export-history-modal.component';

describe('ExportHistoryModalComponent', () => {
  let component: ExportHistoryModalComponent;
  let fixture: ComponentFixture<ExportHistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportHistoryModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
