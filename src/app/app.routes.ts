import { Routes } from '@angular/router';
import { MageusShellComponent } from './features/shell/mageus-shell.component';
import { ArticleReaderComponent } from './features/articles/article-reader.component';
import { ChannelPageComponent } from './features/channels/channel-page.component';
import { CataloguePageComponent } from './features/catalogue/catalogue-page.component';
import { MagazinesPageComponent } from './features/magazines/magazines-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MageusShellComponent,
    children: [
      { path: '', redirectTo: 'mageus/articles', pathMatch: 'full' },

      // Public channel surfaces — authentication is intentionally not required.
      { path: ':username', redirectTo: ':username/articles', pathMatch: 'full' },
      { path: ':username/articles', component: ChannelPageComponent },
      { path: ':username/articles/:slug/:artID', component: ArticleReaderComponent },
      { path: ':username/magazines', component: MagazinesPageComponent },
      { path: ':username/store', component: CataloguePageComponent },
      { path: ':username/catalogue', component: CataloguePageComponent },

      // Global public surfaces.
      { path: 'article/:artID', component: ArticleReaderComponent },
      { path: 'magazines', component: MagazinesPageComponent },
      { path: 'store', component: CataloguePageComponent },
      { path: 'catalogue', component: CataloguePageComponent },

      // Authenticated editor routes will be added back as a separate authoring surface.
      { path: '**', redirectTo: 'mageus/articles' }
    ]
  }
];
