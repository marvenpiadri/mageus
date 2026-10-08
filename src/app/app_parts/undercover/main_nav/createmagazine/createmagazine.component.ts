import { NgFor, NgIf } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '../../../../../environments/environment';
import { GimiappService } from '../../../../gimiapp.service';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';   //import this module

@Component({
    selector: 'app-createmagazine',
    imports: [NgIf, FormsModule, TextFieldModule],
    templateUrl: './createmagazine.component.html',
    styleUrls: ['./createmagazine.component.css']
})

export class CreatemagazineComponent implements OnInit, AfterViewInit {
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  errorBol:boolean = false;
  errorMsg:any;

  file;
  startUpload:boolean = false;
  checked = false;

  Token:any;
  decodedToken:any;
  filePreview;
  magazineTitle:any='';

  constructor(
    public jwtHelper        : JwtHelperService,
    public service          : GimiappService, 
    public activatedRoute   : ActivatedRoute,
    public ref              : DynamicDialogRef,
    public config           : DynamicDialogConfig,
    public router           : Router) { 
      this.Token  = localStorage.getItem('token');
      this.decodedToken = this.Token ? this.jwtHelper.decodeToken(this.Token) : null; 
    }


  ngOnInit() {

  }

  deckHeight;
  deckWidth;
  ngAfterViewInit(): void {
    this.deckHeight = 300;
    this.deckWidth = ((this.deckHeight / 16) * 9);
  }

  preview(event){
    if (event.target.files && event.target.files[0]) {
      this.file = event.srcElement.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.filePreview = event.target.result;
      }
    } 
  }

  removePic(){
    this.file = '';
    this.filePreview = '';
  }

  barPercentage = 0;
  diarySend(){
    if(this.file){
      this.service.postMyMagazine(this.magazineTitle, this.file).subscribe((events:any)=> {
        if(events.type == HttpEventType.UploadProgress){
          this.barPercentage = parseInt(((events.loaded/events.total)*100).toFixed(0));
        }else if(events.type == HttpEventType.Response){
          console.log(events.body)
          this.barPercentage = 0;
          this.ref.close(events.body);
        }
      })
    }
  }

}
