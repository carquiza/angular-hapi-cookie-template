import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;

  public login_error: string = null;

  get email(): AbstractControl { return this.loginForm.get('email'); }
  get password(): AbstractControl { return this.loginForm.get('password'); }

  constructor(public auth:AuthService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
      ]),
    });
  }

  async doLogin() {
    try {
      this.login_error = null;
      var res = await this.auth.doLogin(this.email.value, this.password.value);
      if (res['error']) {
        this.login_error = res['error'];
      }
      else if (res['redirect']) {
        window.location.href = '/';
      }
    }
    catch (error) {
      this.login_error = 'Could not log in. Please try again later.';
    }
  }
}
