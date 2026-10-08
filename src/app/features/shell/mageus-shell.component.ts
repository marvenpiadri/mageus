import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MoodService } from '../../core/moods/mood.service';
import { MoodId } from '../../core/models/article.models';

@Component({
  selector: 'app-mageus-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mageus-shell mood-{{ moodService.mood() }}">
      <div class="mood-layer mood-layer--primary" aria-hidden="true"></div>
      <div class="mood-layer mood-layer--stars" aria-hidden="true"></div>

      <header class="site-header">
        <a class="brand" routerLink="/mageus/articles">mageus</a>

        <nav aria-label="Main navigation">
          <a routerLink="/mageus/articles">Stories</a>
          <a routerLink="/magazines">Magazines</a>
          <a routerLink="/store">Store</a>
        </nav>

        <div class="mood-picker" aria-label="Reading mood">
          @for (mood of moods; track mood) {
            <button
              type="button"
              [class.active]="moodService.mood() === mood"
              [attr.aria-label]="'Use ' + mood + ' mood'"
              (click)="moodService.setMood(mood)">
              {{ mood }}
            </button>
          }
        </div>
      </header>

      <main class="site-main">
        <router-outlet />
      </main>
    </div>
  `
})
export class MageusShellComponent {
  readonly moodService = inject(MoodService);
  readonly moods: MoodId[] = ['stars', 'aurora', 'midnight', 'moonlight', 'eclipse', 'nordic'];
}
