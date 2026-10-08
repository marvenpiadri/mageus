/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Add_sliderComponent } from './add_slider.component';

describe('Add_sliderComponent', () => {
  let component: Add_sliderComponent;
  let fixture: ComponentFixture<Add_sliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Add_sliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Add_sliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
