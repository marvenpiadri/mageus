/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Create_articleComponent } from './create_article.component';

describe('Create_articleComponent', () => {
  let component: Create_articleComponent;
  let fixture: ComponentFixture<Create_articleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Create_articleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Create_articleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
