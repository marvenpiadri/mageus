import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-magazines-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="placeholder-page">
      <span class="eyebrow">Publishing</span>
      <h1>Magazines</h1>
      <p>Magazines will become editorial collections rather than albums of application blocks.</p>
    </section>
  `
})
export class MagazinesPageComponent {}
