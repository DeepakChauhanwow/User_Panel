import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Topnav2Component } from './topnav2.component';

describe('Topnav2Component', () => {
  let component: Topnav2Component;
  let fixture: ComponentFixture<Topnav2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Topnav2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Topnav2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
