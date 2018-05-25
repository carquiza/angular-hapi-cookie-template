import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class AuthService {

  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  displayName: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  displayImage: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  public getIsLoggedInObservable() {
    return this.isLoggedIn.asObservable();
  }

  public getDisplayNameObservable() {
    return this.displayName.asObservable();
  }

  public getDisplayImageObservable() {
    return this.displayImage.asObservable();
  }
  
  constructor(private http: HttpClient) {
    this.updateCredentials();
  }

  updateCredentials() {
    this.http.get('auth/me').subscribe((data) => {
      this.isLoggedIn.next(true);
      console.log(data);
      this.displayName.next(data["displayName"]);
      this.displayImage.next(data["displayImage"]);
    },
    (error) => {
      this.isLoggedIn.next(false);
      this.displayName.next(null);
      this.displayImage.next(null);
    });
  }

  public doLogin(email, password) {
    var auth = `Basic ` + btoa(email + ":" + password);
    let headers = new HttpHeaders({ Authorization: auth });
    this.http.post('auth/login_email', {}, {
      headers: headers
    }).subscribe((data) => {
      this.isLoggedIn.next(true);
      window.location.href = '/';
    });
  }

  public doFacebookLogin = () => {
    var url = `auth/login_facebook`;
    window.location.href = url;
  }

  public doGoogleLogin = () => {
    var url = `auth/login_google`;
    window.location.href = url;
  }

  public doLogout() {
    window.location.href = '/auth/logout';
  }
}
