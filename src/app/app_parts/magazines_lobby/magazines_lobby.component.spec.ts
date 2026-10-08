/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Magazines_lobbyComponent } from './magazines_lobby.component';

describe('Magazines_lobbyComponent', () => {
  let component: Magazines_lobbyComponent;
  let fixture: ComponentFixture<Magazines_lobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Magazines_lobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Magazines_lobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
