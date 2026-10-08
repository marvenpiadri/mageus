import { Component, Input, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-slides',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './article-slides.component.html',
  styleUrls: ['./article-slides.component.css']
})
export class ArticleSlidesComponent implements OnInit {
  @Input() slides: any;
  @Input() height: any;
  @Input() width: any;
  
  IMG_URL = environment.IMG_URL;

  constructor() { }

  ngOnInit() {
    console.log('slide is working')
    console.log(this.slides)

  }

  currentIndex = 2;

  getCardTransform(index: number): string {
    const offset = index - this.currentIndex;
    const scale = index === this.currentIndex ? 1 : 0.9;
    const translateX = offset * 100; // spacing between cards
    const rotate = offset * 2; // optional slight tilt
    return `translateX(${translateX}%) scale(${scale}) rotateY(${rotate}deg)`;
  }
  
  getZIndex(index: number): number {
    return -Math.abs(index - this.currentIndex);
  }
  
  prevSlide() {
    if (this.currentIndex > 0) this.currentIndex--;
  }
  
  nextSlide() {
    if (this.currentIndex < this.slides.length - 1) this.currentIndex++;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

}
