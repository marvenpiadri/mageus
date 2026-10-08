import { Injectable } from '@angular/core';
import { Article, Channel } from '../models/article.models';

const demoArticle: Article = {
  id: 'mageus-foundation',
  slug: 'the-new-mageus',
  title: 'The new Mageus',
  subtitle: 'A publishing space where stories, catalogues and commerce belong together.',
  excerpt: 'Mageus is evolving from a social publication into a public channel for stories, magazines and stores.',
  author: { username: 'mageus', name: 'Mageus' },
  publishedAt: '2026-10-08',
  readingTimeMinutes: 4,
  mood: 'stars',
  blocks: [
    {
      id: 'intro',
      type: 'text',
      data: {
        html: '<p>Mageus is built around a simple idea: <strong>publishing and commerce should feel native to each other.</strong> A creator should be able to tell a story, build an audience, present a catalogue and sell a product without stitching together several services.</p>'
      }
    },
    {
      id: 'quote',
      type: 'quote',
      data: {
        text: 'The story is the doorway. The catalogue and the store are what can come next.'
      }
    },
    {
      id: 'product',
      type: 'product',
      data: {
        name: 'Mageus Product',
        description: 'A product can appear visually inside an article and remain connected to its store listing.',
        price: '—',
        href: '/mageus/store'
      }
    },
    {
      id: 'end',
      type: 'text',
      data: {
        html: '<p>This foundation deliberately keeps the content model independent from the editor. The same blocks can be rendered publicly, edited inline, indexed by search engines and eventually hydrated from PostgreSQL.</p>'
      }
    }
  ]
};

const demoChannel: Channel = {
  username: 'mageus',
  name: 'Mageus',
  bio: 'Stories, catalogues, magazines and stores.',
  mood: 'stars',
  articles: [demoArticle]
};

@Injectable({ providedIn: 'root' })
export class ContentService {
  getArticle(): Article {
    return demoArticle;
  }

  getChannel(): Channel {
    return demoChannel;
  }
}
