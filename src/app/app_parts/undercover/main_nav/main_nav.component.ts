import { Component, HostListener, AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GimiappService } from '../../../gimiapp.service';
import { environment } from '../../../../environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { CreatemagazineComponent } from './createmagazine/createmagazine.component';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NotifsComponent } from './notifs/notifs.component';
import { SearchComponent } from "./search/search.component";
import { SidebarModule } from 'primeng/sidebar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-main_nav',
    templateUrl: './main_nav.component.html',
    styleUrls: ['./main_nav.component.scss'],
    standalone: true,
    providers: [ConfirmationService, MessageService, DynamicDialogRef, DialogService],
    imports: [ SidebarModule, FormsModule, ToggleButtonModule, CommonModule, RouterLink, MatSidenavModule, OverlayModule, NotifsComponent, SearchComponent]
})

export class Main_navComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('sidenav2') sidenav2: MatSidenav;

  isGlassMode = false;

  API_URL  = environment.API_URL;
  IMG_URL  = environment.IMG_URL;
  events: string[] = [];
  opened: boolean;
  pagePath:any;
  Token: string;
  decodedToken: any;
  username;
  apps:any = [];
  notifsCount = 0;
  @ViewChild('navBolCtn') navBolCtn;
  @ViewChild('navBolBut') navBolBut;
  changePfp:any;
  pfp:any;

  positions: ConnectionPositionPair[] = [
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 0,
      offsetX: 50
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -10
    },
  ];

  
  positions2: ConnectionPositionPair[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 50
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -10
    },
  ];
  
  
  modelChanged(e){

  }


  onToggleChange() {
    this.isGlassMode = this.isGlassMode ? false : true;
    this.service.glassModeSubject.next(this.isGlassMode); // emit to subscribers
  }

  //settings
  glassBlur:any = 10;
  glassDark:any = 15;

  navBol    = false;
  quizBol   = false;
  notifBol  = false;
  findBol   = false;
  
  constructor(public service: GimiappService,
    public router: Router,
    public dialogService  : DialogService,
    public ref : DynamicDialogRef,
    public ac_route: ActivatedRoute,
    public jwtHelper: JwtHelperService) { 
      this.pagePath     = this.ac_route.snapshot?.firstChild.routeConfig.path;
      this.Token        = localStorage.getItem('token');
      console.log(this.jwtHelper.decodeToken(this.Token))
      this.decodedToken = this.Token ? this.jwtHelper.decodeToken(this.Token) : null; 
    this.pfp          = localStorage.getItem('pic'); 
    this.username     = this.decodedToken.username;
    this.router.events.forEach((event) => {
      if(event instanceof NavigationEnd) {
        this.pagePath = this.ac_route.snapshot?.firstChild.routeConfig.path;
        this.pagePath == 'notifications' && (this.notifsCount = 0); 
      }
    })

  }
  handleScroll($event){
    console.log($event)
  }
  ngOnInit() {

    this.changePfp = this.service.send_picObs.subscribe((data:any)=>{
      if(data.ref == 2){
        this.pfp = data.pic;

        localStorage.removeItem('pic');
        localStorage.setItem('pic', data.pic)
      }
    })

    this.apps = 
    [
      // {msg: 'Profile',          icon:'user',               notif: 0, ref: '/'+this.decodedToken.username},
      {msg: 'Settings',         icon:'gear',               notif: 0, ref: '/s/account'},
      {msg: 'Wallpaper',        icon:'photo-video',        notif: 0, ref: '/s'},
      {msg: 'Find',             icon:'search',             notif: 0, ref: '/find'},
      // {msg: 'Clubs',            icon:'crown',              notif: 0, ref: 'clubs'}
    ];

    this.getNotifs();

    setInterval(()=>{
      this.getNotifs();
    }, 15000)+
    
    this.pagePath == 'notifications' && (this.notifsCount = 0); 

  }

  ngAfterViewInit() {
    // this.sidenavContainer.scrollable.elementScrolled().subscribe(() => {
    //   console.log("sidenavContainer is scrolled.");
    // });

  }

  ngOnDestroy() {
    this.changePfp.unsubscribe();
  }

  toggleMode() {
    this.isGlassMode = !this.isGlassMode;
  }

  close(ref){
    this.sidenav.close();
    this.sidenav2.close();
    this.notifBol = false;
    this.findBol = false;
  }

  getNotifs(){
    this.service.countNotifs().subscribe((data)=>{
      data.length > 0 ? this.notifsCount = data[0].total : this.notifsCount = 0;
    })
  }
  myScrollHandler($event){
    console.log($event)
  }
  logOut(){
    if(confirm("Are you sure you want to leave ?")){
      localStorage.removeItem('token');
      this.router.navigate(['portal']);
    }
  }

  showMenu_1(){
    this.notifBol ? this.notifBol = false : this.notifBol = true;
    this.notifBol && this.sidenav.open();
    !this.notifBol && this.sidenav.close();
  }

  showFind(){
    this.findBol ? this.findBol = false : this.findBol = true;
    this.findBol && this.sidenav2.open();
    !this.findBol && this.sidenav2.close();
  }

  showMenu_3(){
    this.navBol ? this.navBol = false : this.navBol = true;

  }



  creatBol:boolean = false;
  showEdit(event, creatBol){
    event.stopPropagation();
    this.creatBol ? this.creatBol = false : this.creatBol = true;
  }

  CreateMag(){
    this.ref = this.dialogService.open(CreatemagazineComponent, {
      header: 'Create a magazine',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false,
      closable: true,
      closeOnEscape: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if(data){
        
      }
    })
  }

}
