import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { GimiappService } from '../../../gimiapp.service';
import { environment } from '../../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-wallpapers',
    imports: [],
    templateUrl: './wallpapers.component.html',
    styleUrls: ['./wallpapers.component.css']
})
export class WallpapersComponent implements OnInit {
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;
  pfp;
  wallpaper;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public service: GimiappService,
    private jwtHelper : JwtHelperService

  ) { }

  ngOnInit(): void {
    
    this.service.getPics().subscribe(data => {
      if(data){
        console.log(data)
        this.pfp = data[0].pic;
        this.wallpaper = data[0].wallpaper;
      }
    });
  }

  upload_cover(ref, event){
    if(event.target.files[0]){
      this.service.wallpaperChange(event.target.files[0], ref).subscribe((data)=>{
        if(data.body){
          if(ref == 1){
            this.wallpaper = data.body[0].pic;
            this.service.send_pic.next({ref: 1, pic: data.body[0].pic});
          }else if(ref == 2){
            this.pfp      = data.body[0].pic;
            this.service.send_pic.next({ref: 2, pic: data.body[0].pic});
          }
        }
      })
    }
    
  }

  deletePic(ref){
    if(confirm('Are you sure ?')){
      this.service.deleteProf_pic(ref).subscribe((data)=>{
        if(data.body){
          if(ref == 1){
            this.wallpaper = data.body[0].pic;
            this.service.send_pic.next({ref: 1, pic: data.body[0].pic});
          }else if(ref == 2){
            this.pfp = data.body[0].pic;
            this.service.send_pic.next({ref: 2, pic: data.body[0].pic});
          }
        }
      })
    }

  }

}
