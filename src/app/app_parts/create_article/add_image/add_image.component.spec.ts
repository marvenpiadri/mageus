/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Add_imageComponent } from './add_image.component';

describe('Add_imageComponent', () => {
  let component: Add_imageComponent;
  let fixture: ComponentFixture<Add_imageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Add_imageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Add_imageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
