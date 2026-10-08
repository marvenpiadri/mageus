import { Component, OnInit, ViewChild,AfterContentChecked, AfterViewChecked, AfterViewInit, OnDestroy, HostListener, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { GimiappService } from '../../../../gimiapp.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-magazines',
    imports: [CommonModule, SkeletonModule, RouterLink],
    templateUrl: './magazines.component.html',
    styleUrls: ['./magazines.component.css']
})

export class MagazinesComponent implements OnInit, OnDestroy, AfterViewInit {
  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;


  @Input() headerInfo: any;
  loading: any = true;

  pageDataSub: Subscription;
  dateURL_sub: Subscription;
  magazines:any = [];


  deckRef = 0;
  cardsLen: number;
  qParams: any;
  getMoreDiaries = true;
  magEmpty = false;

  ownerID: any;
  posIndex: number = 0;
  direction: number = 0;
  username: any;

  constructor(
    public service: GimiappService, 
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public changeDetector: ChangeDetectorRef

    ) { 
   
    }

  ngOnInit() {

    this.dateURL_sub = this.activatedRoute.params.subscribe((params:any) => {
      this.username = params.userID;
      this.service.magazines.next([]);
      this.magazines = [];
      this.getMoreDiaries = true;
      this.displayLast10Magz(params.userID);
    })
    
    this.pageDataSub = this.service.magazinesObs.subscribe((data:any) =>{
      console.log(data)

      if(data.length > 0){ 
        if(!data[0].empty){
          this.loading = false;
          this.getMoreDiaries = true;
          for (let index = 0; index < data.length; index++) {
            this.magazines.push(data[index])
          }
        }else if(data[0].empty){
          this.loading = false;
          this.magEmpty = true;
        }
       
      }else{
        this.getMoreDiaries = false;
      }

    })

  }

  ngOnDestroy() {
    this.dateURL_sub.unsubscribe();
    this.pageDataSub.unsubscribe();
    // this.service.magazines.next();
    // this.service.magazines.complete();
  }

  deckHeight;
  deckWidth;
  ngAfterViewInit(): void {
    this.deckHeight = 300;
    this.deckWidth = ((this.deckHeight / 16) * 9);
    this.changeDetector.detectChanges();
  }

  displayLast10Magz(userID){
    this.service.magazinesTitles(userID);
  }

  trimTitle(query) {
    let queryTxt = query;
    let replacedText;

    if(queryTxt.length > 45){
      replacedText =  queryTxt.trim().slice(0, 45) + "...";
    }else{
      replacedText = queryTxt.trim();
    }
    
    return replacedText;
    
  }
  
  arrowNav(ref){
    if(ref == 2 && this.posIndex == 0){
      this.posIndex++;
      this.direction = -((this.deckWidth+15) * this.posIndex);
    }else{
      if(ref == 1 && this.posIndex > 0){
        this.posIndex--;
        this.direction = -((this.deckWidth+15) * this.posIndex);
      }else if(ref == 2 && this.posIndex < (this.magazines.length-1)){
        this.posIndex++;
        this.direction = -((this.deckWidth+15) * this.posIndex);
      }
    }

    if((this.posIndex / (this.magazines.length-1) ) * 100 >= 50 && this.getMoreDiaries){
      this.displayDiairesMore();
    }

  }

  displayDiairesMore(){
    let userID = this.magazines[this.magazines.length-1].user_id;
    let lastID = this.magazines[this.magazines.length-1].mag_id;
    this.service.magazinesTitlesMore(userID, lastID).subscribe((data:any)=>{
      if(data.length > 0){
        for (let index = 0; index < data.length; index++) {
          this.magazines.push(data[index])
        }
      }else{
        this.getMoreDiaries = false;
      }

    });

  }

}
