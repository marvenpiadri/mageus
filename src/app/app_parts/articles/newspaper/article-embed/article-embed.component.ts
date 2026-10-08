import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-article-embed',
  templateUrl: './article-embed.component.html',
  styleUrls: ['./article-embed.component.css']
})
export class ArticleEmbedComponent implements OnInit {
  @Input() embed: any;
  @Input() height: any;
  @Input() width: any;

  constructor() { }

  ngOnInit() {
    console.log(this.embed)
  }

}
