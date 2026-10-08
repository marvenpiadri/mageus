/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { App_partsComponent } from './app_parts.component';

describe('App_partsComponent', () => {
  let component: App_partsComponent;
  let fixture: ComponentFixture<App_partsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ App_partsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(App_partsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
