/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CreatemagazineComponent } from './createmagazine.component';

describe('CreatemagazineComponent', () => {
  let component: CreatemagazineComponent;
  let fixture: ComponentFixture<CreatemagazineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatemagazineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatemagazineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
