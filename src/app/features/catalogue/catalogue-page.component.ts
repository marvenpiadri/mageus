import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-catalogue-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="placeholder-page">
      <span class="eyebrow">Catalogue</span>
      <h1>Catalogue</h1>
      <p>The catalogue layer is being rebuilt around the new article and store model.</p>
    </section>
  `
})
export class CataloguePageComponent {}
