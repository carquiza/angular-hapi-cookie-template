import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public email: string = "":
  public password: string = "";
  public password2: string = "";

  constructor(private auth:AuthService) { }

  ngOnInit() {
  }

  showError(error)
  {
    alert(error);
  }

  async doRegister() {
    if (this.email === "")
    {
      this.showError("Enter your email address");
      return;
    }
    if (this.password === "")
    {
      this.showError("Enter a password");
      return;
    };
    if (this.password !== this.password2)
    {
      this.showError("Passwords must match");
      return;
    };
    try
    {
      await this.auth.doRegisterEmail(this.email, this.password);
    }
    catch (error)
    {
      console.log(error);
      alert(error.error);
    }
  }
}
