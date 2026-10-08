import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service'; // adjust path

export const GuestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // If user is logged in, redirect to profile or homepage
    router.navigate([`/${localStorage.getItem('username') || ''}`]);
    return false;
  }

  return true;
};
