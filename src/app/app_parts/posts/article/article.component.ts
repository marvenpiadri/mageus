import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ImageModule } from 'primeng/image';
import { SkeletonModule } from 'primeng/skeleton';
import { switchMap } from 'rxjs';
import { GimiappService } from '../../../../app/gimiapp.service';
import { environment } from '../../../../environments/environment';
import { ArticleEmbedComponent } from '../../articles/newspaper/article-embed/article-embed.component';
import { ArticleImageComponent } from '../../articles/newspaper/article-image/article-image.component';
import { ArticleSlidesComponent } from '../../articles/newspaper/article-slides/article-slides.component';
import { ArticleTextComponent } from '../../articles/newspaper/article-text/article-text.component';
import {MatIconModule} from '@angular/material/icon'
import { of } from 'rxjs'; // ✅ Add this at the top

@Component({
    selector: 'app-article',
    imports: [
      CommonModule, 
      ArticleEmbedComponent,
      ArticleImageComponent,
      ArticleSlidesComponent,
      ArticleTextComponent,
      SkeletonModule, 
      OverlayModule, 
      ImageModule,
      MatIconModule
    ],
    standalone: true,
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('articleContainer') articleContainer: ElementRef;
  @ViewChild('articleWallpaper') articleWallpaper: ElementRef;
  @Input() data: any;
  
  deploy  = environment.deploy;
  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  pagePath:any;
  articles: any = null

  magPath:any;
  id:any;
  magID:any;
  artID:any;
  cancelSub:any;
  editBol:any = false;
  file    : any;

  deckWidth_16: any = 0;
  deckHeight_9: any = 0;
  wallpaperWidth: any = 0;
  wallpaperHeight: any = 0;
  
  picUploaderOn = false;
  token;
  iUsername;
  userID;

  positions: ConnectionPositionPair[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 10
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -10
    },
  ];

  constructor(
    private jwtHelper       : JwtHelperService,
    private domSanitizer    : DomSanitizer,
    private service         : GimiappService, 
    private titleService    : Title,
    private activatedRoute  : ActivatedRoute,
    public changeDetector   : ChangeDetectorRef,
    private router          : Router) {
      this.token      = localStorage.getItem('token');
      this.iUsername  = this.token ? this.jwtHelper.decodeToken(this.token).username : null; 
      this.userID     = this.token ? this.jwtHelper.decodeToken(this.token).userID : null; 
      this.pagePath   = this.activatedRoute?.snapshot?.routeConfig.path;
      this.router.events.forEach((event) => {
        if(event instanceof NavigationEnd){
          this.pagePath = this.activatedRoute?.snapshot?.routeConfig.path;
        } 
      })

    }

  articleResolution;
  ngAfterViewInit(): void {
    if(this.articleContainer.nativeElement){
      this.deckWidth_16 = this.articleContainer.nativeElement.offsetWidth;
      this.deckHeight_9 = ((this.deckWidth_16 / 16) * 9);
      this.articleResolution = (this.deckWidth_16).toFixed(0)+'x'+this.deckHeight_9.toFixed(0)+'/';
      this.calculateSlideDimensions();
      this.changeDetector.detectChanges();

    }
  }

  ngOnInit() {    
    console.log(this.data)
    // this.getArticle(this.data.article.article_id);

    this.cancelSub = this.service.postEditCancelObs.subscribe(data => {
      if(data) 
        this.editBol = false;
    })

    
  }

  gap: number = 20; // Gap between slides
  slidesPerView: number = 3; // Number of slides visible at once
  carousel_width: number = 0; 
  carousel_height: number = 0; 

  calculateSlideDimensions() {
    const containerWidth = this.articleContainer.nativeElement.offsetWidth;
    this.carousel_width = (containerWidth - (this.gap * (this.slidesPerView - 1))) / this.slidesPerView;
    this.carousel_height = (this.carousel_width / 9) * 16; // Maintain 16:9 aspect ratio
  }

  ngOnChanges(data: SimpleChanges) {
    console.log(this.data.article_id)
    this.artID = this.data.article_id;
    this.getArticle();
    console.log('article_id');
    
    // You can also use categoryId.previousValue and 
    // categoryId.firstChange for comparing old and new values
    
  }

  ngOnDestroy() {
    this.cancelSub.unsubscribe();
  }


  getArticle() {
    this.service.getArticle(this.artID).pipe(
      switchMap((data: any) => {
        if (data && data.article_id) {
          this.articles = {};

          this.articles = data;


          this.articles.parts = []
  
          // Ensure article parts are rendered correctly
          if (Array.isArray(data.article)) {
            data.article.forEach((ds: any) => {
              if (ds.type === 'embed') {
                this.articles.parts.push({
                  type: 'embed',
                  embed: this.domSanitizer.bypassSecurityTrustHtml(
                    ds.embed?.changingThisBreaksApplicationSecurity || ds.embed
                  )
                });
              } else if (ds.type === 'text') {
                this.articles.parts.push({
                  type: 'text',
                  html: this.domSanitizer.bypassSecurityTrustHtml(
                    ds.html?.changingThisBreaksApplicationSecurity || ds.html
                  )
                });
              } else if (ds.type === 'image') {
                this.articles.parts.push({
                  type: 'image',
                  image: ds.image
                });
              } else if (ds.type === 'slide') {
                this.articles.parts.push({
                  type: 'slide',
                  slides: ds.slides
                });
              }
              // Unknown types are ignored
            });
          }
  

          console.log('Full article loaded:', this.articles);
  
          const title = data.title.length > 70
            ? `Article | ${data.title.slice(0, 70)}... • Mageus`
            : `Article | ${data.title} • Mageus`;
  
          this.titleService.setTitle(title);
  
          // ✅ Always return an Observable
          return []
        } else {
          console.warn('Invalid or empty article data.');
          return of(null); // ensure return
        }
      })
    ).subscribe((data) => {
      if (data) {
        // Optionally handle returned data
      }
    });
  }
  

  getAvgMag(stars, voters){
    if((stars / voters) > 0)
      return Number((stars / voters).toFixed(2));
    else
      return 0;
  }

  articleTextShow(text){
    return this.domSanitizer.bypassSecurityTrustHtml(text);
  }
  
  highlight(query, bol) {
    let queryTxt = query;
    let replacedText;

    if(queryTxt.length > 340 && !bol){
      replacedText =  queryTxt.slice(0, 340) + "...";
    }else{
      replacedText = queryTxt;
    }
    
    let urls     = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/ig;
    let emails   = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    let hashtags = /(?<=[\s>]|^)#(\w*[A-Za-z_]+\w*)\b(?!;)/gim;
    let mentions = /(?<![^\s])@([^@\s]+)/gim;

    replacedText = replacedText.replace(emails,   '<span class="emails"><a href="mailto:$1">$1</a></span>');
    replacedText = replacedText.replace(urls,     '<span class="links"><a href="http://$1" target="_blank">$1 </a></span>');
    replacedText = replacedText.replace(hashtags, '<span class="hashtags"><a routerlink="tags/$1">#$1</a></span>');
    replacedText = replacedText.replace(mentions, '<span class="mentions"><a routerlink="/$1">@$1</a></span>');

    return this.domSanitizer.bypassSecurityTrustHtml(replacedText);
    
  }

  showMoreLess(){
    // this.article.showmore ? this.article.showmore = false : this.article.showmore = true;
  }

  postShowArrow(showmore){
    if(showmore){
      return ('Show Less <i class="fas fa-caret-up"></i>');
    }else if(!showmore){
      return ('Show More <i class="fas fa-caret-down"></i>');
    }else{
      return '';
    }
  }

  delete_post(){
    if(confirm('Are you sure you want to delete this article ?')){
      this.service.del_from_mg(this.data.article_id, this.data.post_id).subscribe((data:any)=>{
        this.service.articleDel.next({article_id: this.data.article_id});
        // this.router.navigate(['../'], {relativeTo: this.activatedRoute});
      })
    }
  }
  
  displayEditCont(){
    this.editBol == false ? this.editBol = true : this.editBol = false;
  }

  getAVG(stars, voters){
    if((stars / voters) > 0)
      return Number((stars / voters).toFixed(2));
    else
      return 0;
  }

}
