import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { GimiappService } from '../../gimiapp.service';
import { MagHeaderComponent } from './magHeader/magHeader.component';

@Component({
    selector: 'app-magazines_lobby',
    templateUrl: './magazines_lobby.component.html',
    styleUrls: ['./magazines_lobby.component.css'],
    imports: [InfiniteScrollDirective, RouterOutlet, MagHeaderComponent]
})
export class Magazines_lobbyComponent implements OnInit {
  userID:any;
  path_ref:any;
  subPath:any;

  constructor(
    public service: GimiappService, 
    public router: Router,
    public titleService : Title,
    public activatedRoute: ActivatedRoute
  ) { 
    this.userID     = this.activatedRoute.snapshot.params.userID;
    this.path_ref   = this.activatedRoute.snapshot.routeConfig?.path;
    this.subPath    = this.activatedRoute.snapshot.firstChild.routeConfig?.path;
    // this.subPath   = this.activatedRoute.snapshot?.firstChild.routeConfig?.path;
    this.router.events.forEach((event) => {
      if(event instanceof NavigationEnd){
        this.userID    = this.activatedRoute.snapshot.params.userID;
        this.path_ref  = this.activatedRoute.snapshot.routeConfig?.path;
        this.subPath    = this.activatedRoute.snapshot.firstChild.routeConfig?.path;
        // this.titleService.setTitle(this.userID+" | Demistars");

        // this.subPath   = this.activatedRoute.snapshot?.firstChild.routeConfig?.path;
      }  
    });
 
  }
  
  ngOnInit() {

  }

  onScrollDown(){
    this.service.pageScroll.next(1)
  }
}
