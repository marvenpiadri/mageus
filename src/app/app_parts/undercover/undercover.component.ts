import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";
import { GimiappService } from '../../gimiapp.service';
import { Main_navComponent } from './main_nav/main_nav.component';

@Component({
    selector: 'app-undercover',
    imports: [RouterOutlet, CommonModule, Main_navComponent],
    templateUrl: './undercover.component.html',
    styleUrls: ['./undercover.component.css']
})

export class UndercoverComponent implements OnInit {
  @ViewChild('element') element: ElementRef<HTMLDivElement>;
  glass: boolean = false;

  apps_sub: any;
  coverDataLeft:any;
  coverIND = 0;
  tokenUser:any;
  id       : any;
  tooken   : any;
  lastRoute: string;
  lastPosition: any = 0;

  constructor(
  public activatedRoute: ActivatedRoute, 
  public jwtHelper: JwtHelperService,
  public router: Router,
  private cdref: ChangeDetectorRef,
  public service: GimiappService) {

    this.tooken = localStorage.getItem('token');
    this.tokenUser = this.tooken ? this.jwtHelper.decodeToken(this.tooken).username : null;
  
    this.router.events.forEach((event) => {
      if(event instanceof NavigationEnd) {
        this.tooken = localStorage.getItem('token');
        this.tokenUser = this.tooken ? this.jwtHelper.decodeToken(this.tooken).username : null;
      }
    })

    this.service.glassMode$.subscribe(isGlass => {
      console.log('Glass mode changed:', isGlass);
      // update your cover level UI here
      this.glass = isGlass;
    });

  }

  ngOnInit() {

  }


}
