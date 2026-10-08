import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, DragDropModule} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { GimiappService } from '../../../../app/gimiapp.service';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MatIconModule } from '@angular/material/icon';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-add_slider',
    templateUrl: './add_slider.component.html',
    styleUrls: ['./add_slider.component.css'],
    standalone: true,
    imports: [FileUploadModule, FormsModule, MatIconModule, IconFieldModule, InputIconModule, CdkDropList, DragDropModule, CommonModule, InputTextModule, TextareaModule],
    providers: []
})
export class Add_sliderComponent implements OnInit {
  IMG_URL = environment.IMG_URL;
  articleID:number;
  slides: Array<any> = [];
  content: Array<any> = []
  @ViewChild('sliderUpload') sliderUpload: ElementRef;

  deckWidth_16:number = 0;
  deckHeight_9:number = 0;
  articleWidth:number = 0;
  articleHeight:number = 0;
  postError     :boolean  = false;

  constructor(
    public changeDetector : ChangeDetectorRef,
    public service: GimiappService,
    public ref  : DynamicDialogRef,
    public config: DynamicDialogConfig

  ) { 
    this.articleID = config.data.articleID || '';
    this.slides = config.data.slides || [];
  }

  ngOnInit() {
   
  }

  dragMoved(
    event: CdkDragDrop<string[]>
    ){
    moveItemInArray(this.slides, event.previousIndex, event.currentIndex);
  }
  
  deck_9;
  deck_16;
  postPrev_width;
  postPrev_height;
  ngAfterViewInit(): void {
    this.deckWidth_16 = this.sliderUpload.nativeElement.offsetWidth;
    this.deckHeight_9 = ((this.deckWidth_16 / 16) * 9);

    this.articleWidth   = this.sliderUpload.nativeElement.offsetWidth;
    this.articleHeight  = ((this.articleWidth / 16) * 9);

    this.postPrev_width = ((this.sliderUpload.nativeElement.offsetWidth)/7);
    this.postPrev_height = ((this.postPrev_width / 9) * 16);

    this.deck_9  = ((300 / 16) * 9);;
    this.deck_16   = ((this.deck_9 / 9) * 16);

    this.changeDetector.detectChanges();
    
  }

  cardsLen;
  previewSlideImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
  
    if (file && file.size < 10 * 1024 * 1024) {
      if (this.slides.length < 12) {
        const tempSlide = {
          pic: null,
          link: '',
          label: '',
          loading: true,
          progress: 0
        };
        this.slides.push(tempSlide);
        const index = this.slides.length - 1;
  
        this.service.uploadFile(file).subscribe({
          next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              const percent = Math.round((100 * event.loaded) / event.total);
              this.slides[index].progress = percent;
            } else if (event.type === HttpEventType.Response) {
              const url = event.body.imageUrl;
              console.log(url)
              this.slides[index] = {
                pic: url,
                link: '',
                label: '',
                loading: false,
                progress: 100
              };
            }
          },
          error: () => {
            this.slides.splice(index, 1);
          }
        });
      }
    }
  }

  removePic(ind){
    this.slides.splice(ind, 1);
    this.content.splice(ind, 1);
  }

  duplicateSlide(index: number) {
    const clone = { ...this.slides[index] };
    this.slides.splice(index + 1, 0, clone);
  }

  saveSlides(){
    console.log('save: ', this.slides)
    if(this.slides.length > 0){
      this.ref.close({type: 'slide', content: this.slides});
    }
  }

}
