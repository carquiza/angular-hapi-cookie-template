import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

  isLoggedIn: Observable<boolean>;
  displayName: Observable<string>;
  displayImage: Observable<string>;

  constructor(
    private router: Router,
    private auth: AuthService) {
    this.isLoggedIn = this.auth.getIsLoggedInObservable();
    this.displayName = this.auth.getDisplayNameObservable();
    this.displayImage = this.auth.getDisplayImageObservable();
  }

  ngOnInit() {

  }
}
