import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Article } from '../models/article.models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setArticle(article: Article): void {
    this.title.setTitle(article.title + ' — ' + article.author.name + ' | Mageus');
    this.meta.updateTag({ name: 'description', content: article.excerpt ?? article.subtitle ?? article.title });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:title', content: article.title });
    this.meta.updateTag({ property: 'og:description', content: article.excerpt ?? article.subtitle ?? article.title });
    if (article.cover) {
      this.meta.updateTag({ property: 'og:image', content: article.cover });
    }
  }

  setChannel(channelName: string, description?: string): void {
    this.title.setTitle(channelName + ' — Mageus');
    this.meta.updateTag({ name: 'description', content: description ?? channelName });
  }
}
