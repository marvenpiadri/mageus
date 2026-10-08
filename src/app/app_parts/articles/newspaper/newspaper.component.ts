import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GimiappService } from '../../../../app/gimiapp.service';
import { environment } from '../../../../environments/environment';
import { SkeletonModule }   from 'primeng/skeleton';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { of, switchMap } from 'rxjs';
import { ArticleComponent } from '../../posts/article/article.component';

@Component({
    selector: 'app-newspaper',
    imports: [
    ArticleComponent,
    CommonModule,
    SkeletonModule,
    OverlayModule,
    RouterLink
],
    templateUrl: './newspaper.component.html',
    styleUrls: ['./newspaper.component.css']
})
export class NewspaperComponent implements OnInit, OnDestroy {

  @ViewChild('articleContainer') articleContainer: ElementRef;
  @ViewChild('articleWallpaper') articleWallpaper: ElementRef;
  @Output() post: any;

  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  pagePath:any;
  articles:any = {};
  
  magPath:any;
  id:any;
  magID:any;
  artID:any;
  cancelSub:any;
  editBol:  boolean = false;
  file    : any;

  deckWidth_16: any = 0;
  deckHeight_9: any = 0;
  wallpaperWidth: any = 0;
  wallpaperHeight: any = 0;
  
  picUploaderOn: boolean = false;
  token: any;
  iUsername: any;
  userID: any;
  article_id: any;
  loading: boolean = true;
  
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
    this.article_id = this.activatedRoute?.snapshot?.params?.artID;
    this.pagePath   = this.activatedRoute?.snapshot?.routeConfig.path;
    console.log('news', this.article_id)

    this.router.events.forEach((event) => {
      if(event instanceof NavigationEnd){
        this.pagePath = this.activatedRoute?.snapshot?.routeConfig.path;
        console.log('news', this.article_id)
        this.article_id = this.activatedRoute?.snapshot?.params?.artID;
        this.getArticle();
      } 
    })
  }

  articleResolution
  ngAfterViewInit(): void {
    if(this.articleContainer.nativeElement){
      this.deckWidth_16 = this.articleContainer.nativeElement.offsetWidth;
      this.deckHeight_9 = ((this.deckWidth_16 / 16) * 9);
      this.articleResolution = 'fit-in/'+(this.deckHeight_9).toFixed(0)+'x'+this.deckWidth_16.toFixed(0)+'/';
      this.changeDetector.detectChanges();
    }
  }

  ngOnInit() {    
    this.getArticle();

    this.cancelSub = this.service.postEditCancelObs.subscribe(data => {
      if(data) 
        this.editBol = false;
    })
    
  }


  ngOnDestroy() {
    this.cancelSub.unsubscribe();
  }

  getArticle() {
    this.service.getArticle(this.article_id).pipe(
      switchMap((data: any) => {
        if (data && data.article_id) {

          this.post = data;

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
      this.service.del_from_mg(this.articles.article_id, this.articles.post_id).subscribe((data:any)=>{
        this.service.articleDel.next({article_id: this.articles.article_id});
        this.router.navigate(['../'], {relativeTo: this.activatedRoute});
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
