/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Session_signupComponent } from './session_signup.component';

describe('Session_signupComponent', () => {
  let component: Session_signupComponent;
  let fixture: ComponentFixture<Session_signupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Session_signupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Session_signupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
