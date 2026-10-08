import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { GimiappService } from '../../../app/gimiapp.service';

@Component({
    selector: 'app-feed',
    imports: [InfiniteScrollDirective, RouterOutlet],
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  @ViewChild('element') element: ElementRef;

  dateURL_sub:any;
  lastRoute: string;
  lastPosition: any = 0;


  constructor(
    public service        : GimiappService, 
    public activatedRoute : ActivatedRoute,
    public router: Router

  ) { 

    this.router.events.forEach((event) => {
      
      if(event instanceof NavigationEnd ) {
          
        if(event.url === this.lastRoute){
          this.scrollToBottom();
        }
      
      }

      if (event instanceof NavigationStart) {
        if(event.url !== this.lastRoute) {
          this.lastRoute = this.router.url;
          this.service.feedScroll = this.element.nativeElement.scrollTop;
        }
      }

    })
  }

  ngOnInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    let scrol = this.service.feedScroll;
    setTimeout(()=>{this.element.nativeElement.scrollTop = scrol;}, 1)
  }

  onScrollDown(){
    this.service.pageScroll.next(1)
  }

  scrollToTop(){
     setTimeout(()=>{
      this.element.nativeElement.scrollTop = 0;

    }, 500)
  }

}
