/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Main_navComponent } from './main_nav.component';

describe('Main_navComponent', () => {
  let component: Main_navComponent;
  let fixture: ComponentFixture<Main_navComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Main_navComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Main_navComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
