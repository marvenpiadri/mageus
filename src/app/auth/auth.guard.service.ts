import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service'; // adjust path if needed

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!isLoggedIn) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (requiredRoles && !authService.hasRole(requiredRoles)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};