import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content/content.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-channel-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="channel-page">
      <header class="channel-hero">
        <div>
          <p class="eyebrow">Channel</p>
          <h1>{{ channel().name }}</h1>
          <p>{{ channel().bio }}</p>
        </div>
        <div class="channel-mood">Mood · {{ channel().mood }}</div>
      </header>

      <section class="channel-section">
        <div class="section-heading">
          <span class="eyebrow">Stories</span>
          <h2>Explore the channel</h2>
        </div>

        @for (article of channel().articles; track article.id) {
          <a class="story-card" [routerLink]="['/', channel().username, 'articles', article.slug, article.id]">
            <span class="eyebrow">{{ article.readingTimeMinutes }} min read</span>
            <h3>{{ article.title }}</h3>
            <p>{{ article.excerpt }}</p>
          </a>
        }
      </section>
    </section>
  `
})
export class ChannelPageComponent {
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);

  readonly channel = this.content.getChannel();

  constructor() {
    this.seo.setChannel(this.channel.name, this.channel.bio);
  }
}
