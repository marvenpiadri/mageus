import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ArticleBlock } from '../../core/models/article.models';

@Component({
  selector: 'app-article-block-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (block().type) {
      @case ('text') {
        <section class="article-block article-text" [innerHTML]="textHtml()"></section>
      }
      @case ('quote') {
        <blockquote class="article-block article-quote">{{ text('text') }}</blockquote>
      }
      @case ('image') {
        <figure class="article-block article-image">
          <img [src]="text('src')" [alt]="text('alt')" />
          @if (text('caption')) { <figcaption>{{ text('caption') }}</figcaption> }
        </figure>
      }
      @case ('gallery') {
        <section class="article-block article-gallery">
          @for (image of images(); track image) {
            <img [src]="image" alt="" />
          }
        </section>
      }
      @case ('divider') {
        <hr class="article-divider" />
      }
      @case ('product') {
        <article class="article-product">
          <div>
            <span class="eyebrow">From the store</span>
            <h3>{{ text('name') }}</h3>
            <p>{{ text('description') }}</p>
          </div>
          <a [href]="text('href')">View product</a>
        </article>
      }
      @case ('product-collection') {
        <section class="article-product-collection">
          @for (product of products(); track product.name) {
            <article>
              <span class="eyebrow">Product</span>
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
            </article>
          }
        </section>
      }
    }
  `
})
export class ArticleBlockRendererComponent {
  readonly block = input.required<ArticleBlock>();

  text(key: string): string {
    return String(this.block().data[key] ?? '');
  }

  textHtml(): string {
    return this.text('html');
  }

  images(): string[] {
    return Array.isArray(this.block().data['images'])
      ? this.block().data['images'] as string[]
      : [];
  }

  products(): Array<{ name: string; description: string }> {
    return Array.isArray(this.block().data['products'])
      ? this.block().data['products'] as Array<{ name: string; description: string }>
      : [];
  }
}
