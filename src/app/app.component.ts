import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from './shared/interfaces';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <div class="row">
        <p class="input-field col s6">ID пользователя -  {{userID}}</p>
        <button class="btn waves-effect waves-light input-field " (click)="click()"> Перезайти!</button>
      </div>
      <div class="divider"></div>
      <app-remind></app-remind>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TestTask';

  subscription!: Subscription;
  flag: Boolean = true;

  user: User = {}
  userID = '';

  constructor(private auth: AuthService) {
  }

  ngOnInit(): void {
    this.userID = this.auth.getUserId();
  }

  click(): void {
    this.subscription = this.auth.authorize().subscribe(
      (data: any) => {
        this.user = data;
        this.flag = true;
        console.log(data)
        localStorage.setItem('userId', data.id)
        this.userID = this.auth.getUserId();
      },
      error => console.log(error)
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
