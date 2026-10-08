import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Embed_Service {

// embed.service.ts (example in Angular)
  // Method to detect embed type based on URL
  detectEmbedType(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.includes('soundcloud.com')) {
      return 'soundcloud';
    } else if (url.includes('twitter.com')) {
      return 'twitter';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    } else if (url.includes('spotify.com')) {
      return 'spotify';
    } else if (url.includes('google.com/maps')) {
      return 'googleMaps';
    } else {
      return 'generic'; // For other cases
    }
  }

  // Method to generate iframe for YouTube
  generateYouTubeEmbed(url: string, height:number, width:number): string {
    const videoId = url.split('/')[4].split('?')[0];
    return `<iframe 
    width="${width}" 
    height="${height}"  
    title="YouTube video player"
    llow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    src="https://www.youtube.com/embed/${videoId}" 
    referrerpolicy="strict-origin-when-cross-origin"
    frameborder="0" 
    allowfullscreen></iframe>`;
  }

  // Other methods for different types (Vimeo, SoundCloud, etc.)
}
