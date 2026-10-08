import { Component, OnInit, ViewChild,AfterContentChecked, AfterViewChecked, AfterViewInit, OnDestroy, HostListener, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { GimiappService } from '../../../gimiapp.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-magazines',
  templateUrl: './magazines.component.html',
  styleUrls: ['./magazines.component.css'],
  imports: [ RouterOutlet, CommonModule, RouterLink, SkeletonModule]

})


export class MagazinesComponent implements OnInit, OnDestroy, AfterViewInit {
  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy = environment.deploy;

  @Input() headerInfo: any;
  loading: boolean = true;

  pageDataSub: Subscription;
  routerSub: Subscription;
  magazines: any[] = [];

  deckRef = 0;
  cardsLen: number;
  qParams: any;
  getMoreDiaries = true;
  magEmpty = false;

  ownerID: any;
  posIndex: number = 0;
  direction: number = 0;
  username: any;

  deckHeight: number;
  deckWidth: number;
  magID;

  constructor(
    public service: GimiappService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public changeDetector: ChangeDetectorRef
  ) {
    this.username = this.activatedRoute?.snapshot?.parent?.params?.userID;
    this.magID    = this.activatedRoute?.snapshot?.firstChild?.params?.magID;
    console.log(this.magID)
    // ✅ use subscribe instead of forEach
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.magID    = this.activatedRoute?.snapshot.firstChild?.params?.magID;
        this.username = this.activatedRoute?.snapshot?.parent?.params?.userID;
      }
    });
  }

  ngOnInit() {
    this.displayLast10Magz(this.username);

    this.pageDataSub = this.service.magazinesObs.subscribe((data: any) => {
      if (data.length > 0) {
        if (!data[0].empty) {
          this.loading = false;
          this.getMoreDiaries = true;
    
          data.forEach((mag) => {
            // only add if it's not already in the magazines array
            if (!this.magazines.some((m) => m.mag_id === mag.mag_id)) {
              this.magazines.push(mag);
            }
          });
    
        } else {
          this.loading = false;
          this.magEmpty = true;
        }
      } else {
        this.getMoreDiaries = false;
      }
    });
    
  }

  ngOnDestroy() {
    if (this.pageDataSub) this.pageDataSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.deckHeight = 500;
    this.deckWidth = (this.deckHeight / 16) * 9;
    this.changeDetector.detectChanges();
  }

  displayLast10Magz(userID: any) {
    this.service.magazinesTitles(userID);
  }

  trimTitle(query: string): string {
    return query.length > 45 ? query.trim().slice(0, 45) + "..." : query.trim();
  }

  displayDiairesMore() {
    let userID = this.magazines[this.magazines.length - 1]?.user_id;
    let lastID = this.magazines[this.magazines.length - 1]?.mag_id;

    this.service.magazinesTitlesMore(userID, lastID).subscribe((data: any) => {
      if (data.length > 0) {
        this.magazines.push(...data);
      } else {
        this.getMoreDiaries = false;
      }
    });
  }

}
