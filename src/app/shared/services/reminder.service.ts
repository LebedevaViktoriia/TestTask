import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reminder } from '../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ReminderService {
  constructor(private http: HttpClient) {
  }

  // получение списка напоминаний
  getAllReminder(userId: string): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`/api/reminders?userId=${userId}`);
  }

  //создание попоминания
  creationReminder(reminder: Reminder, userId: string): Observable<Reminder> {
      return this.http.post<Reminder>(`/api/reminders?userId=${userId}`, reminder);
    //                                     /api/reminders?userId={userId}
  }

  //изменение напоминания по его id
  changeReminder(reminder: Reminder,reminderId: string, userId: string): Observable<Reminder> {

    return this.http.put<Reminder>(`/api/reminders/${reminderId}?userId=${userId}`, reminder);
    //PUT                               /api/reminders/{reminderId}?userId={userId}
  }

  //удаление напоминания по его id
  deleteReminder(reminderId: string, userId: string) {
    return this.http.delete(`/api/reminders/${reminderId}?userId=${userId}`)
  }

}
