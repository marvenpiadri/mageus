import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '../../../../environments/environment';
import { GimiappService } from '../../../gimiapp.service';

@Component({
    selector: 'app-magHeader',
    imports: [CommonModule, SkeletonModule, OverlayModule, RouterLink],
    standalone: true,
    templateUrl: './magHeader.component.html',
    styleUrls: ['./magHeader.component.css']
})
export class MagHeaderComponent implements OnInit {
  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  @ViewChild('editContainer') editContainer: ElementRef;

  loading: any = true;
  magID:any;

  headerInfo:any;

  token: any;
  decodedToken: any;
  username;
  editBol = false;
  querySub:any;
  gossip:any = '';

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
      offsetY: 10
    },
  ];

  path_ref;
  subPath;

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

    this.magID    = this.activatedRoute.snapshot.params.magID;
    this.path_ref  = this.activatedRoute.snapshot.routeConfig?.path;
    this.subPath    = this.activatedRoute.snapshot.routeConfig?.path;

    console.log('magID: ', this.magID)

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.magID = this.activatedRoute.snapshot.params['magID'];
        this.path_ref = this.activatedRoute.snapshot.routeConfig?.path;
        this.subPath = this.activatedRoute.snapshot.routeConfig?.path;
    
        if (this.magID) {
          this.loading = true;
          this.service.getMagazineIntro(this.magID).subscribe((data: any) => {
            this.headerInfo = data;
            this.loading = false;
            this.changeDetector.detectChanges();
          });
        }
      }
    });

  }
  
  ngOnInit() {
    if (this.magID) {
      this.service.getMagazineIntro(this.magID).subscribe((data:any)=>{
        this.headerInfo = data;
        this.loading = false;
      });
    }
  }

  ngOnDestroy() {

  }

  magHeight = 300;
  magWidth:any=0;

  ngAfterViewInit(): void {
    this.magWidth = ((this.magHeight / 16) * 9);
    this.changeDetector.detectChanges();
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

}
