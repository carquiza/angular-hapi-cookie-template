import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isLoggedIn: Observable<boolean>;
  displayName: Observable<string>;
  displayImage: Observable<string>;

  constructor(private auth: AuthService) {
    this.isLoggedIn = auth.getIsLoggedInObservable();
    this.displayName = auth.getDisplayNameObservable();
    this.displayImage = auth.getDisplayImageObservable();
  }
}
