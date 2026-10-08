import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, HostListener, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { GimiappService } from '../../../app/gimiapp.service';
import { ActivatedRoute, Router, NavigationEnd, RouterLink} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { AddToMagazineComponent } from './addToMagazine/addToMagazine.component';
import { DialogService } from 'primeng/dynamicdialog';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { CommentsComponent } from "./comments/comments.component";
import { ArticleComponent } from "./article/article.component";

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.css'],
    providers: [MessageService, DialogService],
    imports: [MatSidenavModule, RouterLink, FormsModule,
        SliderModule, SkeletonModule, CommonModule, OverlayModule,
        CommentsComponent, ArticleComponent, AddToMagazineComponent]
})

export class PostsComponent implements OnInit, OnDestroy, AfterViewInit {
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  @ViewChildren('postOptButton') postOptButton;
  @ViewChildren('postOptCtn') postOptCtn;
  @ViewChild('deckHolder') deckHolder: ElementRef;
  @ViewChild('sidenav2') sidenav2: MatSidenav;
  loading: boolean = true;
  articleID:any; 

  deckHeight = 0;
  deckWidth = 0;

  phantomAsk      : boolean = false;
  editBol         : boolean = false;
  showAddToMag    : boolean = false;

  userID          : any;
  posts           : any = [];
  path_ref        : any;
  ref             : any = true;
  userOwner       : any = [];
  //subscribtions///////////////////////////////////////
  token            : any;
  quizID:any;
  lastInd: any;
  PID:any;
  getminis:any;
  getMore:any;
  paramsSubscription:any;
  cancelSub:any;
  articleDelete:any;
  editedIndex:number;
  posts_feeds:any = [];
  posts_userID:any = [];
  offset:number = 0;

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
    public domSanitizer    : DomSanitizer,
    public jwtHelper       : JwtHelperService,
    public service         : GimiappService, 
    public activatedRoute  : ActivatedRoute,
    public changeDetector  : ChangeDetectorRef,
    public dialogService   : DialogService,
    public router          : Router) {
    this.token     = localStorage.getItem('token');
    this.userOwner = this.token ? this.jwtHelper.decodeToken(this.token) : null; 
  }
  
  ngOnInit(){

    this.cancelSub = this.service.postEditCancelObs.subscribe(data =>{
      if(data) 
        this.editBol = false;
    })
    this.paramsSubscription = this.activatedRoute.params.subscribe(a  =>  {
      this.posts    = [];

      if(this.activatedRoute.parent?.snapshot.routeConfig?.path == ':userID'){

        if (this.activatedRoute.parent?.snapshot.params.userID != this.userID){
          this.service.getMiniStories.next([])
        }
        this.path_ref = this.activatedRoute.parent?.snapshot.routeConfig?.path;
        this.PID = this.activatedRoute.snapshot.parent?.params.userID;
        this.userID = this.activatedRoute.snapshot.parent?.params.userID;
        this.getPosts();

      }else if(this.activatedRoute.parent?.snapshot.routeConfig?.path == 'feeds'){
        
        this.path_ref = this.activatedRoute.parent?.snapshot.routeConfig?.path;
        this.getPosts();

      }else if(this.activatedRoute.snapshot.routeConfig?.path == ':articleID'){
      
        this.path_ref = this.activatedRoute.snapshot.routeConfig?.path;
        this.PID = this.activatedRoute.snapshot.params.articleID;
        this.getPosts();



      }

      console.log(this.activatedRoute.snapshot.routeConfig?.path)
    })

    if(this.path_ref == ':userID'){
      this.getminis = this.service.getMiniStoriesObs.subscribe((data)=>{
        this.pushPosts(data);
      })
    }else if(this.path_ref == 'feeds'){
      this.getminis = this.service.feedsMiniStoriesObs.subscribe((data)=>{
        this.pushPosts(data);
      })
    }else if(this.path_ref == ':articleID'){
      this.service.notifMiniStories.next([]);
      this.getminis = this.service.notifMiniStoriesObs.subscribe((data)=>{
        console.log(data)
        this.pushPosts(data);
      })
    }

    this.getMore = this.service.pageScrollObs.subscribe((data:any)=>{
      this.getMorePosts();
    })

    this.articleDelete = this.service.articleDelObs.subscribe((data)=>{
      if(data.article_id){
        let index = this.posts.findIndex((cd) => cd.article_id == data.article_id);
        this.posts[index].article = '';
        this.posts[index].showNewsPaper = false;
      }
    })
    
  }
 
  ngOnDestroy(){
    this.getminis.unsubscribe();
    this.getMore.unsubscribe();
    this.cancelSub.unsubscribe();
    this.paramsSubscription.unsubscribe();
    this.articleDelete.unsubscribe();
  }

  articleHeight;
  articleWidth;
  articleResolution;
  postResolution;
  ngAfterViewInit(): void {

    let height = window.innerHeight - 50;
    
    this.deckHeight = height;
    this.deckWidth = ((height / 16) * 9);
    this.postResolution = 'fit-in/'+this.deckHeight.toFixed(0)+'x'+this.deckHeight.toFixed(0)+'/';

    this.articleHeight = 40;
    this.articleWidth = ((this.articleHeight / 9) * 16);
    this.articleResolution = (this.articleHeight).toFixed(0)+'x'+this.articleWidth.toFixed(0)+'/';

    this.changeDetector.detectChanges();
  }

  getPosts(){
    this.service.getUserPosts_sub(this.userID, this.path_ref, this.PID);
  }

  getMorePosts(){

    if(this.posts.length > 0){
      let index = this.posts[this.posts.length-1].article_id;
      if(this.path_ref == 'magazine/:magID'){
        this.service.getMagazineMorePosts_sub(this.path_ref, index, this.PID);
      }else if(this.path_ref == 'feeds') {
        this.service.getUserMorePosts_sub(this.userID, this.path_ref, index);
      }else {
        this.service.getUserMorePosts_sub(this.userID, this.path_ref, index);
      }
    }
  }
  
  readProg(vs, arts):any{
    let views    = vs ? vs : 0;
    let articles = arts  ? arts  : 0;
    return ((views/articles)*100).toFixed(2); 
  }

  readOrNot(vs, arts):any{
    let views    = vs ? vs : 0;
    let articles = arts  ? arts  : 0;
    let perc = parseInt(((views/articles)*100).toFixed(2));
    if(perc == 100){
      return "#ffffffb3";
    }else{
      return "#49f3cd";
    }
  }

  pushPosts(data){

    if(data.length > 0){
      if(!data[0].empty){
        for (let index = 0; index < data.length; index++) {
          if(this.posts.findIndex((ds :any) => ds.article_id == data[index].article_id) === -1){
            let po            = data[index];

            if (po.photographs?.length > 0) {
              po.media = po.photographs[0]?.media;
            }
              
            if (po.article_id) 
              po.article        = po.article;
              
            po.slide          = 0;
            po.showComment    = false;
            po.showNewsPaper  = false;
            po.editBol        = false;
            this.posts.push(po);
          }  
        }
        this.loading = false;
      }else{
        this.posts = [];
        this.loading = false;
      }
    }
  }

  getSliderValue(event, i): void{
    console.log(this.posts[i].istars)
    this.service.change_rate(this.posts[i].istars, this.posts[i].article_id, this.posts[i].user_id).subscribe((data :any) => { 
      console.log(data)
      if(data.length > 0){
        this.posts[i].voters = data[0].voters;
        this.posts[i].stars  = data[0].stars;
      }else{
        this.posts[i].voters = 0;
        this.posts[i].stars  = 0;
      }
      
    })
    
  }
  
  checkArticlePost(title) {
    if(title.length){
      return 'articleTitleAbs';
    }else{
      return 'articleTitleAbsOff';
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

  postSwitch(e, i){

    let clickTarget = e.target;
    let clickTargetWidth = clickTarget.offsetWidth;
    let xcord      = e.clientX - clickTarget.getBoundingClientRect().left;
    let photograps = this.posts[i].photographs;
    let slide      = this.posts[i].slide;

    if (clickTargetWidth / 2 > xcord) {
      if(slide > 0 ){
        slide--;
        this.posts[i].media = this.posts[i].photographs[slide].media;
        this.posts[i].slide = slide;
      }
    } else {
      if(slide < photograps.length-1 ){
        slide++;
        this.posts[i].media = this.posts[i].photographs[slide].media;
        this.posts[i].slide = slide;
      }
    }
    
  }

  numberPrefix(num) {
    if(num){
      const si = [
        {value: 1e18, symbol: 'E'},
        {value: 1e15, symbol: 'P'},
        {value: 1e12, symbol: 'T'},
        {value: 1e9, symbol: 'G'},
        {value: 1e6, symbol: 'M'},
        {value: 1e3, symbol: 'k'},
        {value: 0, symbol: ''},
      ];
      const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      function divideNum(divider) {
        return (num / (divider || 1)).toFixed(1);
      }
    
      let i = si.findIndex(({value}) => num >= value);
      if (+divideNum(si[i].value) >= 1e3 && si[i - 1]) {
        i -= 1;
      }
      const {value, symbol} = si[i];
      return divideNum(value).replace(rx, '$1') + symbol;
    }else{
      return 0;
    }
  }

  
  highlight(query, bol) {
    let queryTxt = query;
    let replacedText;

    if(query){
      if(queryTxt.length > 80 && !bol){
        replacedText =  queryTxt.trim().slice(0, 80) + "...";
      }else{
        replacedText = queryTxt.trim();
      }
      
    }else{
      return '';
    }
    let urls = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/ig;
    let emails = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    let hashtags = /(?<=[\s>]|^)#(\w*[A-Za-z_]+\w*)\b(?!;)/gim;
    let mentions = /(?<![^\s])@([^@\s]+)/gim;

    replacedText = replacedText.replace(emails,   '<span class="emails"><a href="mailto:$1">$1</a></span>');
    replacedText = replacedText.replace(urls,     '<span class="links"><a href="http://$1" target="_blank">$1 </a></span>');
    replacedText = replacedText.replace(hashtags, '<span class="hashtags"><a routerlink="tags/$1">#$1</a></span>');
    replacedText = replacedText.replace(mentions, '<span class="mentions"><a routerlink="/$1">@$1</a></span>');

    return this.domSanitizer.bypassSecurityTrustHtml(replacedText);
    
  }

  showMoreLess(i){
    this.posts[i].showmore ? this.posts[i].showmore = false : this.posts[i].showmore = true;
  }

  getAVG(stars, voters){
    if((stars / voters) > 0)
      return Number((stars / voters).toFixed(2));
    else
      return 0;
  }
  
  // @HostListener('document:click', ['$event.target'])
  // onClick(targetElement) {
  //   if(typeof this.lastInd === 'number'){

  //     if (!this.postOptButton.toArray()[this.lastInd].nativeElement.contains(targetElement)
  //     && !this.postOptCtn.toArray()[this.lastInd].nativeElement.contains(targetElement)) {  
  //       this.posts[this.lastInd].options = false;
  //       this.lastInd = null;
  //     }
  //   }
  // }

  showEdit(event, i, editBol){
    event.stopPropagation();
    typeof this.lastInd === 'number' && this.posts[this.lastInd] && (this.posts[this.lastInd].editBol = false);
    this.lastInd = i;
    this.editBol ? this.editBol = false : this.editBol = true;
    editBol == false ? this.posts[i].editBol = true : this.posts[i].editBol = false;

  }

  switch_vote(v_switch, i){
    v_switch == '1' ? this.posts[i].v_switch = '2' : this.posts[i].v_switch = '1';
  }
  
  postShowArrow(showmore, i){
    if(showmore){
      return ('Show Less <i class="fas fa-caret-down"></i>');
    }else if(!showmore){
      return ('Show More <i class="fas fa-caret-up"></i>');
    }else{
      return '';
    }
  }

  phantomMode(event, i){
    this.posts[i].checked = event.checked
    this.posts[i].QsPhantom = event.checked ? '2' : '1';
  }

  delete_post(i){
    if(confirm('Are you sure you want to delete this post ?')){
      this.service.delete_post(this.posts[i].article_id).subscribe((data :any) => {
        this.posts[i].options = false;
        this.posts.splice(i, 1);
        this.service.getMiniStories.next(this.posts)
      })
    }
  }

  edit_post(i){
    this.editedIndex = i;
    this.service.postEdit.next({article_id: this.posts[i].article_id, caption: this.posts[i].caption, mag_title: this.posts[i].mag_title});
    this.editBol = true;
  }

  getEmoji(iStars){
    if(iStars == 100)
      return '💯';
    else if(iStars >= 90 && iStars < 100)
      return '💎';
    else if(iStars >= 80 && iStars < 90)
      return '☄️ ';
    else if(iStars >= 70 && iStars < 80)
      return '🔥';
    else if(iStars >= 60 && iStars < 70)
      return '❤️';
    else if(iStars >= 50 && iStars < 60)
      return '🚀';
    else if(iStars >= 40 && iStars < 50)
      return '🍀';
    else if(iStars >= 25 && iStars < 40)
      return '😐';
    else if(iStars >= 10 && iStars < 25)
      return '🍋';
    else if(iStars >= 1 && iStars < 10)
      return '💀';
    else
      return '🥚';
  }
  
  gtProfileRing(article_id, seen, showNewsPaper){

    if(article_id > 0){
      if(!showNewsPaper){
        if(seen > 0){
          return 'profilePicRingSeen'
        }else{
          return 'profilePicRingNotSeen'
        }
      }else{
        return 'profilePicRingReading'
      }
    }else { 
      return 'profilePicRing'
    }
  }

  trimTitle(query) {
    if(query){
      let replacedText;
      if(query.length > 70){
        replacedText =  query.trim().slice(0, 70) + "...";
      }else{
        replacedText = query.trim();
      }
      
      return replacedText;
    }else{
      return '';

    }
 
    
  }

  showComments(i){
    this.posts[i].showNewsPaper = false;
    this.posts[i].showComment == true ? this.posts[i].showComment = false : this.posts[i].showComment = true;
  }

  showNewsPaper(i){
    if(this.posts[i].article_id > 0){
      this.posts[i].showComment = false;
      this.posts[i].showNewsPaper == true ? this.posts[i].showNewsPaper = false : this.posts[i].showNewsPaper = true;
    }
  }

  
  addToMagazine(i){
    this.articleID = this.posts[i].article_id;
    this.posts[i].editBol = false;
    this.sidenav2.open();
    this.showAddToMag ? this.showAddToMag = false : this.showAddToMag = true

  }

  close(ref){
    this.sidenav2.close();
    this.showAddToMag = false;
  }
  
}
