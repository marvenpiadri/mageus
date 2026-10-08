/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Add_embedComponent } from './add_embed.component';

describe('Add_embedComponent', () => {
  let component: Add_embedComponent;
  let fixture: ComponentFixture<Add_embedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Add_embedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Add_embedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
