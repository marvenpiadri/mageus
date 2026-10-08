/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UndercoverComponent } from './undercover.component';

describe('UndercoverComponent', () => {
  let component: UndercoverComponent;
  let fixture: ComponentFixture<UndercoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UndercoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndercoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
