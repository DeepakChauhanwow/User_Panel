import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentEditModalComponent } from './document-edit-modal.component';

describe('DocumentEditModalComponent', () => {
  let component: DocumentEditModalComponent;
  let fixture: ComponentFixture<DocumentEditModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
