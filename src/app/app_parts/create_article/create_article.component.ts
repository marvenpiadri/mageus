import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import Quill from 'quill';
import { GimiappService } from '../../../app/gimiapp.service';
import { environment } from '../../../environments/environment';
import { Add_imageComponent } from './add_image/add_image.component';
import { HttpEventType } from '@angular/common/http';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ToastModule }                  from 'primeng/toast';
import { ConfirmDialogModule }          from 'primeng/confirmdialog';
import { TextFieldModule } from '@angular/cdk/text-field';   //import this module
import { InputTextModule } from 'primeng/inputtext';
import { MatSlideToggleModule }         from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { DragDropModule }               from '@angular/cdk/drag-drop';
import { QuillModule }      from 'ngx-quill'
import { FormsModule } from '@angular/forms';
import { Add_embedComponent } from './add_embed/add_embed.component';
import { Add_textComponent } from './add_text/add_text.component';
import { ImageModule } from 'primeng/image';
import { Add_sliderComponent } from './add_slider/add_slider.component';
import {MatIconModule} from '@angular/material/icon'
import { TextareaModule } from 'primeng/textarea';

import { Embed_Service } from './embed.service';
import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { ArticleEmbedComponent } from '../articles/newspaper/article-embed/article-embed.component';
import { ArticleImageComponent } from '../articles/newspaper/article-image/article-image.component';
import { ArticleSlidesComponent } from '../articles/newspaper/article-slides/article-slides.component';
import { ArticleTextComponent } from '../articles/newspaper/article-text/article-text.component';

@Component({
    selector: 'app-create_article',
    imports: [ToastModule, 
      MatIconModule, 
      TextFieldModule, 
      OverlayModule, 
      CdkDropList,
      CdkDrag,
      QuillModule, 
      FormsModule, 
      DragDropModule, 
      ImageModule,
      CommonModule, 
      ConfirmDialogModule, 
      InputTextModule, 
      MatSlideToggleModule, 
      TextareaModule,
      ArticleEmbedComponent,
      ArticleImageComponent,
      ArticleSlidesComponent,
      ArticleTextComponent],
    templateUrl: './create_article.component.html',
    styleUrls: ['./create_article.component.css'],
    providers: [ConfirmationService, MessageService, DynamicDialogRef, DialogService]
})

export class Create_articleComponent implements OnInit, AfterViewInit {
  @ViewChild('articleContainer') articleContainer: ElementRef;
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef;
  @ViewChild('postsCtn') postsCtn: ElementRef;
 
  article:any = {};

  article_parts:any = [
    {
      type: 0
    }
  ];

  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  uploadStarted: boolean = false;
  includeArticle:boolean = true;

  photographs: Array<any> = [];
  pics = [];

  title:any = '';
  sub_title: any = '';
  descriptionError:any = true;
  deckWidth_16:number = 0;
  deckHeight_9:number = 0;
  articleWidth:number = 0;
  articleHeight:number = 0;
  image: any = '';
  
  onHold = false;

  path_ref: string;
  token: string;
  userOwner: any;
  paramsSubscription: any;
  articleID: any;
  editorContent: any;

  postError     :boolean  = false;
  articleError  :boolean  = false;
  titleError    :boolean  = false;
  artError      :boolean  = false;
  imageError    :boolean  = false;

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
    public router         : Router,
    public activatedRoute : ActivatedRoute,
    public dialogService  : DialogService,
    public service        : GimiappService, 
    public domSanitizer   : DomSanitizer,
    public jwtHelper      : JwtHelperService,
    public changeDetector : ChangeDetectorRef,
    public embedService: Embed_Service,
    private _snackBar: MatSnackBar,
    public ref            : DynamicDialogRef) { 
      this.articleID = this.activatedRoute?.snapshot?.params.articleID;
      this.path_ref  = this.activatedRoute?.snapshot?.routeConfig?.path;
      this.token     = localStorage.getItem('token');
      this.userOwner = this.token ? this.jwtHelper.decodeToken(this.token) : null; 
      

      this.router.events.forEach((event) => {
        if(event instanceof NavigationEnd){
          this.path_ref  = this.activatedRoute?.snapshot?.routeConfig?.path;
          this.articleID     = this.activatedRoute?.snapshot?.params.articleID;
        } 
      })

      
  }

  deck_9;
  deck_16;
  postPrev_width;
  postPrev_height;

  carousel_width;
  carousel_height;
  ngAfterViewInit(): void {

    this.deckWidth_16 = this.thumbnailContainer.nativeElement.offsetWidth;
    this.deckHeight_9 = ((this.deckWidth_16 / 16) * 9);

    this.articleWidth   = this.articleContainer.nativeElement.offsetWidth;
    this.articleHeight  = ((this.articleWidth / 16) * 9);

    this.postPrev_width = ((this.postsCtn.nativeElement.offsetWidth - (15 * 3))/4);
    this.postPrev_height = ((this.postPrev_width / 9) * 16);


    // compute container dimensions

    this.calculateSlideDimensions();

    this.deck_9  = ((300 / 16) * 9);;
    this.deck_16   = ((this.deck_9 / 9) * 16);

    this.changeDetector.detectChanges();
    
  }

  gap: number = 20; // Gap between slides
  slidesPerView: number = 3; // Number of slides visible at once

  calculateSlideDimensions() {
    const containerWidth = this.articleContainer.nativeElement.offsetWidth;
    this.carousel_width = (containerWidth - (this.gap * (this.slidesPerView - 1))) / this.slidesPerView;
    this.carousel_height = (this.carousel_width / 9) * 16; // Maintain 16:9 aspect ratio
  }
  responsiveOptions
  ngOnInit() {
    if(this.path_ref == 'edit/:articleID' || this.path_ref == 'write'){
      this.getArticle();
    }

    this.responsiveOptions = [
      {
          breakpoint: '1400px',
          numVisible: 2,
          numScroll: 1
      },
      {
          breakpoint: '1199px',
          numVisible: 3,
          numScroll: 1
      },
      {
          breakpoint: '767px',
          numVisible: 2,
          numScroll: 1
      },
      {
          breakpoint: '575px',
          numVisible: 1,
          numScroll: 1
      }
  ]
    // this.path_ref == 'edit/:postID' ? this.includeArticle = true : this.includeArticle = false;
  }

  getArticle(){
    if(this.articleID){
      this.service.getEditArticle(this.articleID).subscribe((data:any) => {
        console.log(data[0]) 
        if(data.length > 0){
          this.article = JSON.parse(data[0].article);
          this.title = data[0].title;
          this.image = data[0].image;
          this.sub_title = data[0].sub_title;
          // this.quillEditorRef.root.innerHTML  = this.article;

        }else{
          // this.router.navigate(['/new/'+this.postID])
        }
      })
    }
  }

  titleLimit(text){
    let limit = 40;
    if(text.length > limit){
      return text.slice(0, limit)+'..';
    }else {
      return text;
    }
  }

  changeCover(){
    this.ref = this.dialogService.open(Add_imageComponent, {
      header: 'Upload the image',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      data: {
        articleID: this.articleID,
      },
      baseZIndex: 10000,
      maximizable: false,
      closable: true,
      closeOnEscape: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.image = data.content;
      }
    })
  }

  upload_article(e){

    if(this.includeArticle){
      if(this.title.length > 0 && this.image){
        if(!this.uploadStarted && this.path_ref == 'edit/:articleID'){

          this.uploadStarted = true;
          this.service.editArticle(this.userOwner.userID, this.articleID, this.title, this.sub_title, this.image, this.article_parts).subscribe((data)=>{
            if(data){
              this.uploadStarted = false;
              this.router.navigate([this.userOwner.username])
            }
          })  

        }else if (this.path_ref == 'write'){
          if(this.photographs.length > 0){
            this.uploadStarted = true;
            this.service.articleUpload(this.photographs, this.userOwner.userID, this.title, this.sub_title, this.image, this.article_parts).subscribe((data)=>{
              if(data.body){
                console.log(data.body)
                this.uploadStarted = false;
                this.router.navigate(['a/'+data.body.article_id])
              }
            })  
          }else {
            this._snackBar.open("Post cannot be empty" , 'Okay', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 5 * 1000
            });
            this.postError = true;
            setTimeout(() => {
              this.postError = false;
            }, 5000);
          }
        }
      }else{
        this._snackBar.open("Article cannot be empty" , 'Okay', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5 * 1000
        });
        this.articleError = true;
        this.titleError   = true;
        this.artError     = true;
        this.imageError   = true;
        setTimeout(() => {
          this.articleError = false;
          this.titleError   = false;
          this.artError     = false;
          this.imageError   = false;
        }, 5000);
      }
  
    }else{
      if(this.photographs.length > 0){
    
      }else {
        this._snackBar.open("Post cannot be empty" , 'Okay', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5 * 1000
        });
        this.postError = true;
        setTimeout(() => {
          this.postError = false;
        }, 5000);
      }
    }

  }

  includeArticleF(event){
    this.includeArticle = event.checked;
  }

  dragStart(event){

  }

  dragMoved(event: CdkDragDrop<string[]>){
    moveItemInArray(this.photographs, event.previousIndex, event.currentIndex);
  }

  cardsLen: number = 0;
  posIndex: number = 0;
  direction: number = 0;
  maxImages: number = 12;
  
  preview(event: any) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
  
    if (!files) return;
  
    const remainingSlots = this.maxImages - this.photographs.length;
    const validFiles = Array.from(files).slice(0, remainingSlots);
  
    for (let file of validFiles) {
      if (file.size < 10 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (ev: any) => {
          const obj = {
            file: file,
            pic: ev.target.result
          };
          this.photographs.push(obj);
          this.cardsLen = this.photographs.length;
  
          // Auto-scroll to last image
          this.posIndex = this.photographs.length > 3 ? this.photographs.length - 3 : 0;
          this.direction = -((this.postPrev_width + 15) * this.posIndex);
        };
        reader.readAsDataURL(file);
      } else {
        // Optional: show error
        // this.displayError("Image must be under 10MB.");
      }
    }
  }
  
  removePic(ind: number) {
    this.photographs.splice(ind, 1);
    this.pics.splice(ind, 1);
  
    // Adjust posIndex if needed
    if (this.posIndex >= this.photographs.length) {
      this.posIndex = Math.max(0, this.photographs.length - 1);
    }
    this.direction = -((this.postPrev_width + 15) * this.posIndex);
  }
  
  arrowNav(ref: number) {
    const maxIndex = this.photographs.length - 1;
  
    if (ref === 2 && this.posIndex < maxIndex) {
      this.posIndex++;
    } else if (ref === 1 && this.posIndex > 0) {
      this.posIndex--;
    }
  
    this.direction = -((this.postPrev_width + 15) * this.posIndex);
  }

  embedTheVideo(ind:number){

    this.ref = this.dialogService.open(Add_embedComponent, {
      header: 'Add an embed code',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      data: {
        magazineID: 'this.magazineID'
      },
      baseZIndex: 10000,
      maximizable: false,
      closable: true,
      closeOnEscape: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        const type = this.embedService.detectEmbedType(data.content);
        console.log(type)
        let embedHtml;
        switch(type) {
          case 'youtube':
            embedHtml = this.embedService.generateYouTubeEmbed(data.content, this.articleHeight, this.articleWidth);
            break;
          case 'vimeo':
            // Handle Vimeo embed generation
            break;
          case 'soundcloud':
            // Handle SoundCloud embed generation
            break;
          case 'twitter':
            // Handle Twitter embed generation
            break;
          case 'instagram':
            // Handle Instagram embed generation
            break;
          case 'spotify':
            // Handle Spotify embed generation
            break;
          case 'googleMaps':
            // Handle Google Maps embed generation
            break;
          default:
            embedHtml = data.content; // Fallback to generic embed (e.g., iframe or code)
        }

        let article_part = {
          type: 'embed',
          embed: this.domSanitizer.bypassSecurityTrustHtml(embedHtml),
          editBol: false
        }
        this.article_parts.splice(ind, 0, article_part);
      }
    })
 
  }

  addTheImage(ind){
    this.ref = this.dialogService.open(Add_imageComponent, {
      header: 'Upload the image',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      data: {
        magazineID: 'this.magazineID'
      },
      baseZIndex: 10000,
      maximizable: false,
      closable: true,
      closeOnEscape: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        let article_part = {
          type: 'image',
          image: data.content,
          editBol: false
        }
        this.article_parts.splice(ind, 0, article_part);
      }
    })
  }

  addTheSlides(ind){
    this.ref = this.dialogService.open(Add_sliderComponent, {
      header: 'Upload a Deck:',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      data: {
        magazineID: 'this.magazineID'
      },
      baseZIndex: 10000,
      maximizable: false,
      closable: true,
      closeOnEscape: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        let article_part = {
          type: 'slide',
          slides: data.content,
          editBol: false
        }
        console.log(data.content, article_part)
        this.article_parts.splice(ind, 0, article_part);
      }
    })
  }

  addTheText(ind){
    this.ref = this.dialogService.open(Add_textComponent, {
      header: 'Write text',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      data: {
        magazineID: 'this.magazineID'
      },
      baseZIndex: 10000,
      maximizable: true,
      closable: true,
      closeOnEscape: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        let article_part = {
          type: 'text',
          html: this.domSanitizer.bypassSecurityTrustHtml(data.content),
          editBol: false
        }
        this.article_parts.splice(ind, 0, article_part);
      }
    })
  }

  deletePart(ind){
    this.article_parts.splice(ind, 1);
  }

  editPart(art, ind){

    if(art.type == 'text'){
      this.ref = this.dialogService.open(Add_textComponent, {
        header: 'Write text',
        width: '60%',
        contentStyle: { overflow: 'auto' },
        data: {
          articlePart: art.html
        },
        baseZIndex: 10000,
        maximizable: true,
        closable: true,
        closeOnEscape: true
      });
  
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.article_parts[ind].html = this.domSanitizer.bypassSecurityTrustHtml(data.content)
        }
      })
    }else if (art.type == 'image'){

      this.ref = this.dialogService.open(Add_imageComponent, {
        header: 'Upload the image',
        width: '60%',
        contentStyle: { overflow: 'auto' },
        data: {
          image: art.image
        },
        baseZIndex: 10000,
        maximizable: false,
        closable: true,
        closeOnEscape: true
      });
  
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.article_parts[ind].image = data.content;
        }
      })

    }else if (art.type == 'embed'){

      this.ref = this.dialogService.open(Add_embedComponent, {
        header: 'Add an embed code',
        width: '60%',
        contentStyle: { overflow: 'auto' },
        data: {
          image: art.image
        },
        baseZIndex: 10000,
        maximizable: false,
        closable: true,
        closeOnEscape: true
      });
  
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.article_parts[ind].embed = this.domSanitizer.bypassSecurityTrustHtml(data.content);
        }
      })

    }else if (art.type == 'slide'){

      this.ref = this.dialogService.open(Add_sliderComponent, {
        header: 'Upload a Deck:',
        width: '60%',
        contentStyle: { overflow: 'auto' },
        data: {
          slides: art.slides,
          articleID: this.articleID
        },
        baseZIndex: 10000,
        maximizable: false,
        closable: true,
        closeOnEscape: true
      });
  
      this.ref.onClose.subscribe((data: any) => {
        console.log('part: ', this.article_parts[ind])
        if (data) {
          this.article_parts[ind].slides.content = data.slides;
        }
      })

    }
    
  }

  configurePart(art: any, index: number) {
    console.log('Configure part', art, index);
    // Your configure logic here
  }
  
  lastInd;
  toggleOptions(index, editBol){
    typeof this.lastInd === 'number' && this.article_parts[this.lastInd] && (this.article_parts[this.lastInd].editBol = false);
    this.lastInd = index;
    editBol == false ? this.article_parts[index].editBol = true : this.article_parts[index].editBol = false;
  }
  
  publishArticle() {
    // Your logic to save/publish the article
    console.log('Publishing article...');
  }
  saveDraft() {
    // Your logic to save/publish the article
    console.log('Publishing article...');
  }

}