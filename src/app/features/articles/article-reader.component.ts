import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content/content.service';
import { SeoService } from '../../core/seo/seo.service';
import { ArticleBlockRendererComponent } from './article-block-renderer.component';

@Component({
  selector: 'app-article-reader',
  standalone: true,
  imports: [ArticleBlockRendererComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="article-reader">
      <a class="back-link" [routerLink]="['/', article().author.username, 'articles']">← {{ article().author.name }}</a>

      <header class="article-header">
        <p class="eyebrow">Story · {{ article().readingTimeMinutes }} min read</p>
        <h1>{{ article().title }}</h1>
        @if (article().subtitle) { <p class="article-subtitle">{{ article().subtitle }}</p> }
        <div class="article-meta">
          <span>{{ article().author.name }}</span>
          <span>{{ article().publishedAt }}</span>
        </div>
      </header>

      @if (article().cover) {
        <img class="article-cover" [src]="article().cover" [alt]="article().title" />
      }

      <div class="article-content">
        @for (block of article().blocks; track block.id) {
          <app-article-block-renderer [block]="block" />
        }
      </div>
    </article>
  `
})
export class ArticleReaderComponent {
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  readonly article = this.content.getArticle();

  constructor() {
    this.route.params.subscribe(() => this.seo.setArticle(this.article));
  }
}
