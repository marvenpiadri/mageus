import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
  
import { routes } from './app.routes';
import { GimiappService } from './gimiapp.service';
import { Title } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.service';
import { JwtHelperService,  JwtModule,  JWT_OPTIONS  } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuillModule } from 'ngx-quill';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    providePrimeNG({ 
      theme: {
          preset: Aura
      }
    }),
    GimiappService,
    Title,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'always' } },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: JWT_OPTIONS, useValue: { tokenGetter: () => localStorage.getItem('token') } }, // ✅ FIXED
    JwtHelperService,
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom([BrowserAnimationsModule, QuillModule])
  ]
};
