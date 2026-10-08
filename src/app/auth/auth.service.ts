import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  hasRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some(role => userRoles.includes(role));
  }
}