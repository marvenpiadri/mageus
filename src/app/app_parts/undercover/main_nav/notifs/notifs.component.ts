import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GimiappService } from '../../../../../app/gimiapp.service';
import { environment } from '../../../../../environments/environment';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { NgFor, NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notifs',
    imports: [CommonModule, RouterLink, MatSidenavModule, OverlayModule, InfiniteScrollDirective],
    templateUrl: './notifs.component.html',
    styleUrls: ['./notifs.component.css']
})

export class NotifsComponent implements OnInit, OnDestroy {
  IMG_URL = environment.IMG_URL;

  notifs:any  = [];
  notifsOffset     = 0;
  notifScrollBol:boolean = false;
  constructor(
    public activeRoute: ActivatedRoute,
    public router: Router,
    public service: GimiappService) { }

  height = 0;
  width = 35;
  notifRes;
  ngOnInit() {
    this.height = ((this.width / 9) * 16)
    this.notifRes = this.height.toFixed(0)+'x'+this.width.toFixed(0)+'/';
    this.notifsOffset = 0;    
    this.displayNotifs(this.notifsOffset);
    // this.service.markView().subscribe(data=>{});

  }

  ngOnDestroy(){
  }

  readnotifs(id, type_id, postID){
    this.service.readNotif(id, type_id).subscribe((data) => {
      if(data){
        if(type_id == 5){
          this.notifs.filter(ds => ds.type_id == type_id).forEach(dr => dr.seen = true)
        }else{
          this.notifs.filter(ds => ds.id == id).forEach(dr => dr.seen = true)
        }
      }
    })
  }

  displayNotifs(offset){
 
    this.service.getNotifs(offset).subscribe((data) => {
      for (let index = 0; index < data.length; index++) {
          this.notifs.findIndex((ds) => ds.notif_id === data[index].notif_id) === -1 && this.notifs.push(data[index]);
          if(index == (data.length-1)){
            this.notifScrollBol = false;
          }
        }
    })
  }


  onScrollDown(){
    this.notifsOffset += 15;
    this.displayNotifs(this.notifsOffset);
  }

  getUrlForNotifs(id, article_id, type, ind){
    if(type == 1 || type == 2 || type == 3 || type == 4){
      return '/a/'+article_id;
    }else if(type == 5){
      let username = this.notifs[ind].username;
      return '/'+username;
    }else{
      return '#';
    }
  }
  
  iconType(type){
    if(type == 1){
      return 'fa-solid fa-chart-simple';
    }else if (type == 2){
      return 'fas fa-comment';
    }else if (type == '3'){
      return 'fas fa-star';
    }else if (type == '4'){
      return 'fas fa-reply';
    }else if (type == '5'){
      return 'fa-solid fa-user-plus';
    }else if (type == '6'){
      return 'fas fa-bolt';
    }else if (type == '7'){
      return 'fas fa-star';
    }else if (type == '8'){
      return 'fa-solid fa-at';
    }else if (type == '9'){
      return 'fas fa-dice';
    }else{
      return ''
    }
  }

  title(text){
    let limit;
    limit = 80;
    if(text.length > limit){
      return text.slice(0, limit)+'..';
    }else {
      return text;
    }
  }

}
