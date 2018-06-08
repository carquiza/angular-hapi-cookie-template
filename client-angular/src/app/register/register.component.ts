import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registrationForm: FormGroup;
  submitInvalid: boolean = false;
  
  passwordDoesNotMatch: boolean = false;
  serverError: string = null;

  constructor(private auth:AuthService) { }

  get email(): AbstractControl { return this.registrationForm.get('email'); }
  get password(): AbstractControl { return this.registrationForm.get('password'); }
  get password2(): AbstractControl { return this.registrationForm.get('password2'); }

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'email': new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      'password': new FormControl('', [
        Validators.required,
        Validators.minLength(7),
      ]),
      'password2': new FormControl('', [
        Validators.required,
        Validators.minLength(7),
      ]),
    });
  }

  showError(error)
  {
    alert(error);
  }

  async doRegister() {
    this.submitInvalid = false;
    if (this.registrationForm.invalid) {
      this.submitInvalid = true;
      return;
    }
    this.passwordDoesNotMatch = false;
    if (this.password.value !== this.password2.value)
    {
      this.passwordDoesNotMatch = true;
      return;
    };

    try
    {
      await this.auth.doRegisterEmail(this.email.value, this.password.value);

    }
    catch (error)
    {
      console.log("ERROR");
      console.log(error);
      this.serverError = error.error;
    }
  }
}
