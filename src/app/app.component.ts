import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingBarModule, NgxLoadingBar } from '@ngx-loading-bar/core';

@Component({ 
  selector: 'app-root',
  imports: [RouterOutlet, NgxLoadingBar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mageus';
}
  