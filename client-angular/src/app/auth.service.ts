import { Injectable } from '@angular/core';

const TOKEN_STORAGE_NAME: string = 'token';
const CREDENTIALS_STORAGE_NAME: string = 'credentials';

@Injectable()
export class AuthService {

  public displayName: string = "";

  constructor() { }

  public getToken(): string {
    return localStorage.getItem(TOKEN_STORAGE_NAME);
  }

  public setToken(token: string) {
    localStorage.setItem(TOKEN_STORAGE_NAME, token);
  }

  public clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_NAME);
    localStorage.removeItem(CREDENTIALS_STORAGE_NAME);
    this.displayName = "";
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null;
  }
}
