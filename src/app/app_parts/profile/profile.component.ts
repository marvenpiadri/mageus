import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { GimiappService } from '../../../app/gimiapp.service';
import {InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProfileHeaderComponent } from "./profileHeader/profileHeader.component";
import { MagazinesComponent } from "./profileHeader/magazines/magazines.component";
import { PostsComponent } from '../posts/posts.component';
import { ProfileBarComponent } from './profile-bar/profile-bar.component';

@Component({
    selector: 'app-profile',
    imports: [InfiniteScrollDirective, ProfileBarComponent, RouterOutlet],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('element') element: ElementRef<HTMLDivElement>;
  _scrollPos;
  dateURL_sub;
  userID: any;
  path_ref: string;
  check:any;
  subPath:any;
  lastRoute: string;
  lastPosition: any = 0;
  paramsSubscription:any;
  phantasm:boolean = false;
  querySub:any;
  headerInfo:any;
  pageLoading:boolean = true;

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
        this.titleService.setTitle(this.userID+" | Demistars");

        // this.subPath   = this.activatedRoute.snapshot?.firstChild.routeConfig?.path;
      }
    });
 
  }

  ngOnInit() {
    this.checkIfExists();
    // this.scrollToBottom();
    this.querySub = this.activatedRoute.params.subscribe((params:any) => {
      this.userID = this.activatedRoute?.snapshot?.params.userID;
      this.service.profileHeader(this.userID).subscribe((data:any)=> {
        if(data)
          this.headerInfo = data,
          this.titleService.setTitle( "Profile | "+this.headerInfo.name+' (@'+this.headerInfo.username+')'+" • Demistars");
          this.pageLoading = false;
      })
    })

  }

  ngOnDestroy() {
    this.querySub.unsubscribe();
  }

  onScrollDown(){
    this.service.pageScroll.next([{bol: true}]);
    console.log('scrolled');
  }

  checkIfExists(){
    this.service.checkUserExist(this.userID).subscribe(data=>{
      this.check = data
    })
  }
  
  getTitleNav(){
    if(this.subPath == ''){
      return 'Posts';
    }else if(this.subPath == 'Gossips'){
      return 'Gossips';
    }else if(this.subPath == 'Articles'){
      return 'Articles';
    }else {
      return '';
    }
  }

  phantomMode(event){
    this.phantasm = event.checked;
  }

  sendDare(){
    // if(this.dare.trim().length > 0)
    //   this.service.sendDare(this.dare, this.phantasm, this.headerInfo.user_id).subscribe((event:any)=>{}),
    //   this.dare = '';

  }

}
