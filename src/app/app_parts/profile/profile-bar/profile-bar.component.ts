import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../environments/environment';
import { GimiappService } from '../../../../app/gimiapp.service';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-profile-bar',
  imports: [CommonModule, RouterLink, SkeletonModule,  OverlayModule],
  templateUrl: './profile-bar.component.html',
  styleUrls: ['./profile-bar.component.css']
})
export class ProfileBarComponent implements OnInit {

  @ViewChild('editContainer') editContainer: ElementRef;
  @Input() headerInfo: any;
  @Input() userID: any;
  @Input() loading: any;

  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  token: any;
  decodedToken: any;
  username;
  editBol = false;
  querySub:any;
  gossip:any = '';
  phantasm:boolean = false;

  positions: ConnectionPositionPair[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 8
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: 10
    },
  ];
  path_ref: string;
  subPath: string;

  constructor(
    public service          : GimiappService,
    public jwtHelper        : JwtHelperService,
    public domSanitizer     : DomSanitizer,
    public router           : Router,
    public changeDetector   : ChangeDetectorRef,
    public titleService     : Title,
    public activatedRoute   : ActivatedRoute) { 

    this.token      = localStorage.getItem('token');
    this.decodedToken = this.token ? this.jwtHelper.decodeToken(this.token) : null; 
    this.username = this.decodedToken.username;
    this.path_ref  = this.activatedRoute.snapshot.routeConfig?.path;
    this.subPath    = this.activatedRoute.snapshot.firstChild.routeConfig?.path;
      console.log(this.subPath)
    // this.subPath   = this.activatedRoute.snapshot?.firstChild.routeConfig?.path;
    this.router.events.forEach((event) => {
      if(event instanceof NavigationEnd){
        this.userID    = this.activatedRoute.snapshot.params.userID;
        this.path_ref  = this.activatedRoute.snapshot.routeConfig?.path;
        this.subPath    = this.activatedRoute.snapshot.firstChild.routeConfig?.path;
        this.titleService.setTitle(this.userID+" | Mageus");

        // this.subPath   = this.activatedRoute.snapshot?.firstChild.routeConfig?.path;
      }
    });

  }
  
  ngOnInit() {
 
  }

  deleteFollow(){
    if(confirm('Are you sure you want to unfollow this user ?')){
      this.service.unfollow(this.headerInfo.user_id).subscribe((data:any)=> {
        this.headerInfo.ifollow = 0;
        this.headerInfo.followers -= 1;
      })
    }
  }

  follow(){
    this.service.follow(this.headerInfo.user_id).subscribe((data:any)=> {
      this.headerInfo.ifollow = 1;
      this.headerInfo.followers += 1;
    })
  }


  editPost(event){
    this.editBol ? this.editBol = false : this.editBol = true;

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

  
  highlight(query) {
    let replacedText = query.trim();
    
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

  
  phantomMode(event){
    this.phantasm = event.checked;
  }
 
  sendDare(){
    if(this.gossip.trim().length > 0)
      this.service.sendGossip(this.gossip, this.phantasm, this.headerInfo.user_id).subscribe((event:any)=>{}),
      this.gossip = '';
  }


}
