import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userId = '';

  constructor(private http: HttpClient) {
  }

  //авторизация пользователя
  authorize() {
    return this.http.post('/api/auth', {});
  }

  //берём из локалсторадж id пользователя
  getUserId(): string {
    return <string>localStorage.getItem('userId');
  }
}
