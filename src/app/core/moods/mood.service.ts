import { Injectable, signal } from '@angular/core';
import { MoodId } from '../models/article.models';

@Injectable({ providedIn: 'root' })
export class MoodService {
  readonly mood = signal<MoodId>('stars');

  setMood(mood: MoodId): void {
    this.mood.set(mood);
  }
}
