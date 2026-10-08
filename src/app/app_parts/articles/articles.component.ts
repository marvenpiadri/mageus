import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { GimiappService } from '../../../app/gimiapp.service';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-articles',
    imports: [CommonModule, RouterLink, RouterOutlet],
    templateUrl: './articles.component.html',
    styleUrls: ['./articles.component.css']
})

export class ArticlesComponent implements OnInit, OnDestroy {
  @ViewChild('deckHolder') deckHolder: ElementRef;

  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  magID: any;
  articles: any = [];
  article: any = {
    article: ''
  };
  username:number;
  article_id:number;
  artOffset = 0;
  mag_header:any={};
  lastInd:any;
  magazineHeadTitle:any;

  // subscriptions 
  articleView_sub:any;
  articlePic_sub:any;
  articleDel_sub:any;
  articleTitle_sub:any;
  getMore:any;

  // Paths
  path_ref:any;
  subPath:any;
  parentPath:any;

  constructor(public router: Router,
              private titleService: Title,
              public activatedRoute: ActivatedRoute,
              public changeDetector  : ChangeDetectorRef,
              public service: GimiappService) {

    this.parentPath = this.activatedRoute?.snapshot?.parent?.routeConfig?.path;
    this.subPath    = this.activatedRoute?.firstChild?.snapshot?.routeConfig?.path;
    this.path_ref   = this.activatedRoute?.snapshot?.routeConfig?.path;
    this.article_id = this.activatedRoute?.snapshot?.firstChild?.params?.artID;
    this.magID      = this.activatedRoute?.snapshot?.parent?.params?.magID;
    this.username   = this.activatedRoute?.snapshot?.parent?.params.userID;
    console.log(this.activatedRoute?.snapshot?.parent?.params.userID)
    this.router.events.forEach((event) => {
      if(event instanceof NavigationEnd){
        this.parentPath = this.activatedRoute?.snapshot?.parent?.routeConfig?.path;
        this.subPath    = this.activatedRoute?.firstChild?.snapshot?.routeConfig?.path;
        this.path_ref   = this.activatedRoute?.snapshot?.routeConfig?.path;
        this.article_id = this.activatedRoute?.snapshot?.firstChild?.params?.artID;
        this.magID      = this.activatedRoute?.snapshot?.parent?.params?.magID;
        this.username   = this.activatedRoute?.snapshot?.parent?.params.userID;
      } 
    })

  }  

  ngOnInit() {
    this.getArticles();
    console.log(this.parentPath)
    this.articleView_sub = this.service.articleMagViewObs.subscribe((data:any)=>{
      if(data){
        this.articles.filter(ds => ds.article_id === data.article_id).forEach(ds => { ds.iviews = 1, ds.views += 1} );
        this.mag_header.iviews += 1;
      }
    }) 

    this.articleDel_sub = this.service.articleDelObs.subscribe((data:any)=>{
      if(data){
        let index = this.articles.findIndex(ds => ds.article_id == data.article_id);
        this.articles.splice(index, 1)
        this.mag_header.views -= 1;;
        this.mag_header.articles -= 1;;
        if(this.articles.length < 10)
          this.onScrollDown();
      }
    }) 
       
    this.getMore = this.service.pageScrollObs.subscribe((data)=>{
      console.log('scoll', data);
      
      if(data > 0){
        this.onScrollDown();
      }
    })

  }

  ngOnDestroy(){
    this.articleView_sub.unsubscribe();
    this.articleDel_sub.unsubscribe();
    this.getMore.unsubscribe();
  }

  articleHeight;
  articleWidth;
  ngAfterViewInit(): void {

    let Width = (window.innerWidth - 50)/4;
    console.log(Width);

    this.articleWidth = Width;
    this.articleHeight = ((this.articleWidth / 16) * 9);

    this.changeDetector.detectChanges();
  }
  
  onScrollDown(){
    let lastIndex = this.articles[this.articles.length-1].article_id;

    if(this.parentPath == ':userID'){
      this.service.getArticsScroll(this.username, lastIndex).subscribe((data:any) => {
        if(data){
          for (let i = 0; i < data.length; i++) {
            if(this.articles.findIndex((ds :any) => ds.article_id === data[i].article_id) === -1){
              this.articles.push(data[i]);
            }
          }
        }
      })
    }else if(this.parentPath == 'magazine/:magID'){
      this.service.getArticsMagazineScroll(this.magID, lastIndex).subscribe((data:any) => {
        if(data){
          for (let i = 0; i < data.length; i++) {
            if(this.articles.findIndex((ds :any) => ds.article_id === data[i].article_id) === -1){
              this.articles.push(data[i]);
            }
          }
        }
      })
    }
    
  }

  getArticles(){
    if(this.articles.length < 1 && this.parentPath == ':userID'){
      this.service.getArtics(this.username).subscribe((data:any) => {
        if(data){
          for (let i = 0; i < data.length; i++) {
            if(this.articles.findIndex((ds :any) => ds.article_id === data[i].article_id) === -1){
              this.articles.push(data[i]);
            }
          }
        }
      })
    } else if(this.articles.length < 1 && this.parentPath == 'magazine/:magID'){
    console.log(this.parentPath, this.magID)

      this.service.getArticsMagazine(this.magID).subscribe((data:any) => {
        if(data){
          for (let i = 0; i < data.length; i++) {
            if(this.articles.findIndex((ds :any) => ds.article_id === data[i].article_id) === -1){
              this.articles.push(data[i]);
            }
          }
        }
      })
    }
  }

  getData(iStars){
    if(iStars == 100)
      return 'starIconGold';
    else if(iStars > 0 && iStars < 100)
      return 'starIconAc';
    else
      return 'starIcon';
  }

  readProg(){
    let views    = this.mag_header?.views ? this.mag_header?.views : 0;
    let articles = this.mag_header?.articles   ? this.mag_header?.articles   : 0;
    return ((views/articles)*100).toFixed(2); 
  } 

  title(text, ref){
    let limit;
    ref == 1 ? limit = 70 : limit = 85
    if(text.length > limit){
      return text.slice(0, limit)+'..';
    }else {
      return text;
    }
  }

  editPost(){
    let options = this.mag_header.options;
    options == false ? this.mag_header.options = true : this.mag_header.options = false;
  }

  delete_post(){

  }

  readOrNot(number){
    if(number==100){
      return "#ffffff4d";
    }else{
      return "#49f3cd";
    }
  }

  switchArticles(){
    let showArts = this.mag_header.showArts;
    showArts ? this.mag_header.showArts = false : this.mag_header.showArts = true;
  }

  getAvgMag(stars, voters){
    if((stars / voters) > 0)
      return Number((stars / voters).toFixed(2));
    else
      return 0;
  }

  rateArticle(article_id, star){
  
    this.mag_header.istars = star;

    this.service.rateMag(article_id, this.mag_header.user_id, star).subscribe((data:any) => {
      if(data.length > 0){
        this.mag_header.istars = data[0].istars;
      }else{
        this.mag_header.istars = 0;
      }
    })

  }


}
