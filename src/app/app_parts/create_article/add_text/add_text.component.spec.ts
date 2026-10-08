/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Add_textComponent } from './add_text.component';

describe('Add_textComponent', () => {
  let component: Add_textComponent;
  let fixture: ComponentFixture<Add_textComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Add_textComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Add_textComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
