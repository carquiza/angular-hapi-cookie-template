import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class AuthService {

  constructor(private http:HttpClient) { }

  public doLogin(email, password) {
    var auth = `Basic ` + btoa(email + ":" + password);
    let headers = new HttpHeaders({ Authorization: auth });
    this.http.post('auth/login_email', {}, {
      headers: headers
    }).subscribe((data) => {
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
