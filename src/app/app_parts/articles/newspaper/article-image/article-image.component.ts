import { Component, OnInit, Input } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-image',
  standalone: true,
  imports:[ImageModule],
  templateUrl: './article-image.component.html',
  styleUrls: ['./article-image.component.css']
})
export class ArticleImageComponent implements OnInit {
  IMG_URL = environment.IMG_URL;
  @Input() src: any;

  constructor() { }

  ngOnInit() {
    console.log(this.src)
  }

}
