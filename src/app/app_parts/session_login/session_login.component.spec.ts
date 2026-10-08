/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Session_loginComponent } from './session_login.component';

describe('Session_loginComponent', () => {
  let component: Session_loginComponent;
  let fixture: ComponentFixture<Session_loginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Session_loginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Session_loginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
