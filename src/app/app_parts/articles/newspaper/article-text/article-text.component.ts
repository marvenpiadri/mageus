import { Component, Input, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import hljs from 'highlight.js';

@Component({
  selector: 'app-article-text',
  templateUrl: './article-text.component.html',
  styleUrls: ['./article-text.component.css']
})
export class ArticleTextComponent implements OnInit, AfterViewInit  {
  @Input() html: string = '';

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.fixQuillPreTags();
    this.highlightAllCode();
  }

  private fixQuillPreTags() {
    const preTags = this.elRef.nativeElement.querySelectorAll('pre');
    preTags.forEach((pre: HTMLElement) => {
      // Skip if already wrapped
      if (pre.querySelector('code')) return;

      const code = document.createElement('code');
      code.innerHTML = pre.innerHTML;
      pre.innerHTML = '';
      pre.appendChild(code);
    });
  }

  private highlightAllCode() {
    const blocks = this.elRef.nativeElement.querySelectorAll('pre code');
    blocks.forEach((block: HTMLElement) => {
      console.log(block);
      
      hljs.highlightElement(block);
    });
  }

}
