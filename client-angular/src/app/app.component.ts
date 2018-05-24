import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';  

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private http: HttpClient, private auth: AuthService) { }

  title = 'app';
  isLoggedIn: boolean = false;
  email: string = '';
  password: string = '';

  displayName: string = '';
  displayImage: string = '';
  loginType: string = '';

  error: string = null;

  updateCredentials() {
    this.isLoggedIn = this.auth.isAuthenticated();
    let credentials_string = localStorage.getItem('credentials');
    if (credentials_string) {
      let credentials = JSON.parse(credentials_string);
      this.displayName = credentials.name;
      this.displayImage = credentials.image;
      this.loginType = credentials.login;
    }
    else
    {
      this.displayName = '';
      this.displayImage = '';
      this.loginType = '';
    }
  }

  ngOnInit() {
    this.updateCredentials();
  }

  doLogin() {
    let payload = { email: this.email, password: this.password };
    this.http.post('auth/login', payload).subscribe((data) => {
        if (data['token'])
        {
          this.auth.setToken(data['token']);
          this.isLoggedIn = true;
          localStorage.setItem('credentials', JSON.stringify(data['credentials']));
          this.updateCredentials();
        }
        else if (data['error'])
        {
          console.log(data['error']);
          this.error = `Login error: ${data['error']}`;
        }
        else
        {
          console.log(data);
          this.error = `Login error: ${data.toString()}`;
        }
      },
      (error) => {
        console.log(error);
        this.error = `Error: ${error}`;
      });
  }

  doLogout() {
    this.auth.clearToken();
//    this.isLoggedIn = false;
    window.location.href = '/auth/logout';
  }

  tryAuthorizedOnly = () => {
    this.http.get('auth/me').subscribe((data) => {
      alert(data);
      this.error=`success ${data}`;
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
    var url = `auth/login_facebook`;
    window.location.href = url;
  }
}
