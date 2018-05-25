import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  doLogin() {
    var auth = `Basic ` + btoa(this.email + ":" + this.password);
    let headers = new HttpHeaders({ Authorization: auth });
    this.http.post('auth/login_email', {}, {
      headers: headers
    }).subscribe((data) => {
      window.location.href = '/';
    });
  }

  doFacebookLogin = () => {
    var url = `auth/login_facebook`;
    window.location.href = url;
  }

  doGoogleLogin = () => {
    var url = `auth/login_google`;
    window.location.href = url;
  }

  doLogout() {
    window.location.href = '/auth/logout';
  }

}
