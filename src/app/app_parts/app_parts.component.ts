import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";
import { GimiappService } from '../gimiapp.service';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app_parts',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app_parts.component.html',
  styleUrls: ['./app_parts.component.css']
})

export class App_partsComponent implements OnInit, OnDestroy, AfterViewInit {

  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  apps_sub: any;
  coverDataLeft:any;
  coverIND = 0;
  tokenUser:any;
  id       : any;
  tooken   : any;
  wallpaper : any;
  pageUser : any;
  pagePath : any;
  diaryQuery : any;
  changePfp:any;
  
  constructor(
    public activatedRoute: ActivatedRoute, 
    public jwtHelper: JwtHelperService,
    public router: Router,
    public changeDetector  : ChangeDetectorRef,
    public service: GimiappService) {

      this.loadGeoData();

      this.pageUser = this.activatedRoute?.firstChild.snapshot?.params.userID;
      this.pagePath = this.activatedRoute?.firstChild.snapshot?.routeConfig.path;
      this.diaryQuery = this.activatedRoute?.snapshot?.queryParams;

      this.router.events.forEach((event) => {

        if(event instanceof NavigationEnd) {
          this.tooken = localStorage.getItem('token');
          this.tokenUser = this.tooken ? this.jwtHelper.decodeToken(this.tooken).username : null;
          this.pageUser = this.activatedRoute?.firstChild.snapshot?.params.userID;
          this.pagePath = this.activatedRoute?.firstChild.snapshot?.routeConfig.path;

          if(this.pagePath == ':userID')
            this.getCovers(this.pageUser);
          else 
            this.getCovers(this.tokenUser);      

        }
      })

  }

  ngOnInit() {

    this.changePfp = this.service.send_picObs.subscribe((data:any)=>{
      if(data.ref == 1){
        this.wallpaper = data.pic;
      }
    })


    if(this.pagePath == ':userID')
      this.getCovers(this.pageUser);
    else 
      this.getCovers(this.tokenUser);
  }
  
  deckHeight;
  deckWidth;
  resolution = '';

  ngAfterViewInit(): void {
    this.deckHeight = window.innerHeight;
    this.deckWidth = (( this.deckHeight / 16) * 9);

    this.resolution = ''+this.deckHeight.toFixed(0)+'x'+this.deckWidth.toFixed(0)+'/'
    this.changeDetector.detectChanges();
  }

  ngOnDestroy(){
    this.changePfp.unsubscribe();
  }

  getCovers(userID :any){
    if(this.tokenUser){
      this.service.GetCovers(userID).subscribe((data :any) =>{
        if(data.length > 0){
          this.wallpaper = data[0].wallpaper;
        }
      })
    }else{
      this.wallpaper = 'DEMI_1675402642811.1cm9bh73sldo3h4sb_STAR.jpg';
    }
   
  }

  geoData: any;
  loadGeoData() {
    const cachedGeoData = localStorage.getItem('geoData');
    const cachedTime = localStorage.getItem('geoDataTime');
    
    // Cache is still valid (for example, for 1 hour)
    const isCacheValid = cachedGeoData && cachedTime && (Date.now() - parseInt(cachedTime) < 3600000); // 1 hour cache time
    
    if (isCacheValid) {
      this.geoData = JSON.parse(cachedGeoData);
    } else {
      this.fetchGeoData();
    }
  }

  resizeTimeout:any;
  windowWidth:number = 0;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.windowWidth = event.target.innerWidth;
    }, 200); // adjust debounce time
  }

  // Fetch new geolocation data
  fetchGeoData() {
    this.service.getGeoData().subscribe((data: any) => {
      console.log(data)
      this.geoData = data;

      // Cache the geo data in localStorage
      localStorage.setItem('geoData', JSON.stringify(data));
      localStorage.setItem('geoDataTime', Date.now().toString());
    }, error => {
      console.error('Error fetching geo data:', error);
    });
  }

}
