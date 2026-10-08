import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appSnapScroll]'
})
export class SnapScrollDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 0;
  @Input() threshold = 1;
  @Output() inViewport = new EventEmitter();

  intersecting = false
  visibilityChange: any;
  _observer: IntersectionObserver | undefined;

  constructor(private element: ElementRef) {
    // this.el.nativeElement.style.backgroundColor = 'yellow';
 }
  ngOnInit() {
    this.createAndObserve(this.element)
  }

  ngOnDestroy() {
 
  }

  
  createAndObserve(element: ElementRef) {
    const options = {
      root: null,
      threshold: 1
    };

    this._observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        // console.log('s', entry)
        if (entry.isIntersecting) {
          this.inViewport.emit(entry.target)
          console.log('isIntersecting')
        } else {
          console.log('isNot')
        }

      });
    }, options);
    this._observer.observe(element.nativeElement);
  }
}

