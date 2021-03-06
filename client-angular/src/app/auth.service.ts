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

  public async doRegisterEmail(email, password) {
    var res = await this.http.post('auth/register_email', { email: email, password: password }).toPromise();
    if (res['error'])
    {
      throw res;
    }
    window.location.href = '/';
  }

  public async doLogin(email, password) {
    try {
      var res = await this.http.post('auth/login_email', { email: email, password: password }).toPromise();
      if (res['error'])
      {
        return { error: res['error'] };
      }
      else if (res['redirect'])
      {
        return { redirect: res['redirect'] };
      }
    }
    catch (error) {
      console.log(error);
    }

    return { error: 'Could not log in. Please try again later.' };
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
