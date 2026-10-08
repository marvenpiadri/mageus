import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { environment } from '../../../../environments/environment';
import { GimiappService } from '../../../gimiapp.service';

@Component({
    selector: 'app-addToMagazine',
    imports: [CommonModule, InfiniteScrollDirective],
    templateUrl: './addToMagazine.component.html',
    styleUrls: ['./addToMagazine.component.css']
})

export class AddToMagazineComponent implements OnInit, OnDestroy {
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  addedCache: Map<string, boolean> = new Map();


  errorBol:boolean = false;
  @Input() articleID: any;
  errorMsg:any;
  magazines:Array<any> = [];
  file;
  startUpload:boolean = false;
  checked = false;

  Token:any;
  decodedToken:any;
  filePreview;
  magazineTitle:any='';
  post_id;
  pageDataSub:any;
  
  constructor(
    public jwtHelper       : JwtHelperService,
    public service         : GimiappService, 
    public activatedRoute  : ActivatedRoute,
    public router          : Router) { 
      this.Token     = localStorage.getItem('token');
      this.decodedToken = this.Token ? this.jwtHelper.decodeToken(this.Token) : null; 
    }

  deckHeight;
  deckWidth;

  ngOnInit() {
    this.deckHeight = 230;
    this.deckWidth = ((this.deckHeight / 16) * 9);
  
    this.pageDataSub = this.service.myMagazinesObs.subscribe((data: any) => {
  
      if (data.length > 0) { 
        // Push magazines to local array
        data.forEach((mag: any) => {
          if (!this.magazines.find(m => m.mag_id === mag.mag_id)) {
            this.magazines.push(mag);
          }
  
          // CACHE the 'added' status for this.articleID immediately
          // if (this.articleID != null && mag.added !== undefined) {
          //   const key = `${this.articleID}_${mag.mag_id}`;
          //   this.addedCache.set(key, mag.added === 1); 
          //   // true if added, false if not
          //   console.log(this.addedCache)
          // }
        });
  
        // Now we can safely check other articles if needed
        this.onArticleVisible(this.articleID); // optional for additional checks
      } else {
        this.displayLast10Magz();
      }
    });
  }

  ngOnDestroy() {
    this.pageDataSub.unsubscribe();
    // this.service.myMagazines.next([])
    // this.magazines = [];
  }


  displayLast10Magz(){
    this.service.myMagazinesTitles(this.articleID);
  }

  onArticleVisible(articleId: number) {
    const magIdsToCheck = this.magazines
      .filter(m => !this.service.addedCache.has(`${articleId}_${m.mag_id}`))
      .map(m => m.mag_id);
    console.log(magIdsToCheck)
    if (magIdsToCheck.length === 0) {
      this.magazines.forEach(m => {
        const key = `${articleId}_${m.mag_id}`;
        if (this.service.addedCache.has(key)) m.added = this.service.addedCache.get(key) ? 1 : 0;
      });
      return;
    }
  
    this.service.checkArticleInMagazines(articleId, magIdsToCheck)
      .subscribe((res: any) => {
        console.log(res)
        magIdsToCheck.forEach(magId => {
          const key = `${articleId}_${magId}`;
          this.service.addedCache.set(key, res[magId]);
          const magIndex = this.magazines.findIndex(m => m.mag_id === magId);
          if (magIndex !== -1) this.magazines[magIndex].added = res[magId] ? 1 : 0;
        });
      });
  }
  
  
  addToMagazine(magID, i) {
    this.service.addToMagazine(this.articleID, magID).subscribe((data: any) => {
      const key = `${this.articleID}_${magID}`;
      this.addedCache.set(key, data.insert);
  
      this.magazines[i].pages = parseInt(this.magazines[i].pages) + (data.insert ? 1 : -1);
      this.magazines[i].added = data.insert ? 1 : 0;
    });
  }

  preview(event){
    if (event.target.files && event.target.files[0]) {
      this.file = event.srcElement.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.filePreview = event.target.result;
      }
    } 
  }

  removePic(){
    this.file = '';
    this.filePreview = '';
  }

  barPercentage = 0;
  diarySend(){
    if(this.file){
      this.service.postMyMagazine(this.magazineTitle, this.file).subscribe((events:any)=> {
        if(events.type == HttpEventType.UploadProgress){
          this.barPercentage = parseInt(((events.loaded/events.total)*100).toFixed(0));
        }else if(events.type == HttpEventType.Response){
          console.log(events.body)
          this.barPercentage = 0;
        }
      })
    }
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

  onScrollDown(){
    let lastID = this.magazines[this.magazines.length-1].mag_id;
    this.service.myMagazinesTitlessMore_sub(this.articleID, lastID).subscribe((data:any)=>{

    })
  }

  // addToMagazine(magID, i){
  //   this.service.addToMagazine(this.articleID, magID).subscribe((data:any)=>{
  //     console.log(data)
  //     if(data.insert){
  //       this.magazines[i].pages = parseInt(this.magazines[i].pages) + 1;
  //       this.magazines[i].added = 1;
  //     }else {
  //       this.magazines[i].pages = parseInt(this.magazines[i].pages) - 1;
  //       this.magazines[i].added = 0;
  //     }
 
  //   })
  // }

}
