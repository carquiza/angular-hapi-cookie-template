import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';  

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private http: HttpClient, private auth: AuthService) {}

  title = 'app';
  isLoggedIn: boolean = false;
  email: string = '';
  password: string = '';

  displayName: string = '';
  displayImage: string = '';
  loginType: string = '';

  error: string = null;

  updateCredentials = async () => {
    console.log("updateCredentials()");
    this.http.get('/auth/me').subscribe(
      (data) => {
        if (data["displayName"]) {
          console.log("updateCredentials() succeeded");
          this.isLoggedIn = true;
          this.displayName = data["displayName"];
          this.displayImage = data["displayImage"];
        }
        else
        {
          console.log("updateCredentials() failed");
          this.isLoggedIn = false;
          this.displayName = "";
          this.displayImage = "";
        }
      }
    )
    this.isLoggedIn = this.auth.isAuthenticated();
  }

  ngOnInit() {
    this.updateCredentials();
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

  doLogout() {
    this.auth.clearToken();
//    this.isLoggedIn = false;
    window.location.href = '/auth/logout';
  }

  tryAuthorizedOnly = async () => {

    this.http.get('/auth/me').subscribe((data) => {
      alert(`Welcome ${data["displayName"]}`);
      this.error=`success, accessed data for ${data["displayName"]}`;
      },
      (error) => {
        this.error = `error ${error}`;
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
}
