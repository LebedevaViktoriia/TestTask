import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Reminder } from './interfaces';
import { ReminderService } from './services/reminder.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { formatDate } from '@angular/common';
import { AuthService } from './services/auth.service';
import { MaterialInstance, MaterialService } from './services/material.service';

@Component({
  selector: 'app-remind',
  template: `
    <div class="row" xmlns="http://www.w3.org/1999/html">
      <p class="input-field col s12">Создать новое напоминание:</p>
      <div class="divider"></div>
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="col s12">
        <div class="row">
          <div class="input-field col s6">
            <input
              id="note"
              type="text"
              formControlName="note"
              class="validate">
            <label for="note" class="active">Текст напоминания</label>
          </div>
          <div class="input-field col s6">
            <input
              class="col s6"
              type="datetime-local"
              formControlName="date"
              id="date"
              value="{{dateNow | date:'yyyy-MM-ddTH:mm'}}"
              min="{{dateNow | date:'yyyy-MM-ddTH:mm'}}"
              max="{{maxDate(dateNow) | date:'yyyy-MM-ddTH:mm'}}"
            ><label for="date" class="active">Дата и время</label>
          </div>
        </div>
        <button
          class="btn waves-effect waves-light"
          type="submit"
          [disabled]="form.invalid || form.disabled"
        >Создать!
        </button>
      </form>
    </div>
    <div *ngIf="flag; else load">
      <p>Напоминания:</p>
      <table>
        <thead>
        <tr>
          <th>Название</th>
          <th>Дата</th>
          <th>Время</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let r of reminders"
            [ngStyle]="{backgroundColor: getColor(r.status)} ">
          <td>{{r.note}}</td>
          <td>{{r.date | date:'dd.MM.yy' : 'GMT'}}</td>
          <td>{{r.date | date:'H:mm': 'GMT'}}</td>
          <td class="right">
            <button *ngIf="r.status != 'done'"
                    (click)="change(r)"
                    class="btn waves-effect yellow black-text"
                    style="margin-right: 10px">
              <i class=" material-icons">
                update</i>
              изменить
            </button>
            <button
              class="btn waves-effect red "
              (click)="delete(r.id)">
              <i class="material-icons">delete</i>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <ng-template #load>
      <app-loader></app-loader>
    </ng-template>
    <div #modal class="modal">
      <button class="btn waves-effect red right"
              (click)="closeModal()"
      ><i class="material-icons">close</i></button>
      <div class="modal-content">
        <h4>Изменить напоминание</h4>
        <form
          [formGroup]="formModal"
          (ngSubmit)="onSave()">
          <div class="row">
            <div class="input-field col s6">
              <input type="text"
                     id="noteChange"
                     formControlName="noteChange"
                     class="validate">
              <label for="noteChange"
                     class="active">
                Текст напоминания</label>
            </div>
            <div class="input-field col s6">
              <input type="datetime-local"
                     id="dateChange"
                     formControlName="dateChange"
                     class="validate"
                     value="{{dateNow| date:'yyyy-MM-ddTH:mm'}}"
                     min="{{dateNow| date:'yyyy-MM-ddTH:mm'}}">
              <label for="dateChange"
                     class="active">
                Дата и время</label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn waves-effect waves-light">Сохранить!</button>
          </div>
        </form>
      </div>
    </div>
  `
})

export class RemindComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('modal') modalRef!: ElementRef;
  modal!: MaterialInstance;

  sub!: Subscription;

  form!: FormGroup;
  formModal!: FormGroup;

  reminders: Reminder[] = [
    // {
    //   note: 'пойти к врачу',
    //   date: '2021-09-22T11:16:00.000Z',
    //   id: '12345678910',
    //   userId: 'VSGYvHReUj7fv0IZ5d8e____'
    // },
    // {
    //   note: 'пойти к ТЕРАПЕВТУ',
    //   date: '2021-09-22T16:09:00.000Z',
    //   id: '12345678911',
    //   userId: 'VSGYvHReUj7fv0IZ5d8e===='
    // },
    // {
    //   note: 'пойти к ЗУБНОМУ',
    //   date: '2021-10-25T11:16:00.000Z',
    //   id: '12345678912',
    //   userId: 'VSGYvHReUj7fv0IZ5d8e????'
    // }
    // ,
    // {
    //   note: 'пойти к ЛОГОПЕДУ',
    //   date: '2021-09-22T16:10:30.000Z',
    //   id: '12345678911',
    //   userId: 'VSGYvHReUj7fv0IZ5d8e===='
    // },
  ];

  reminderChange!: Reminder;
  flag: boolean = false;

  dateNow = new Date(Date.now());

  userId = '';
  nowDate = '';

  constructor(private reminderService: ReminderService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        note: new FormControl(null, [Validators.required]),
        date: new FormControl(formatDate(this.dateNow, 'yyyy-MM-ddTH:mm', 'en'), [Validators.required])
      }
    );
    this.formModal = new FormGroup(
      {
        noteChange: new FormControl('', [Validators.required]),
        dateChange: new FormControl('', [Validators.required])
      }
    );
    console.log(this.reminders)
    this.userId = this.authService.getUserId();
    this.nowDate = formatDate(this.dateNow, 'yyyy-MM-ddTH:mm:ss', 'en');
    this.get();
  }

  get() {
    this.reminderService.getAllReminder(this.userId).subscribe(
      reminders => {
        this.reminders = reminders;
        this.flag = true;
        this.timerRemainder()
      },
      error => {
        MaterialService.toast('Ошибка с ответом сервера! Попробуйте позже')
        console.log(error);
      }
    );
  }

  identify(index: any, item: any) {
    return item.id;
  }

  onSubmit() {
    let currDate = new Date(this.form.value.date)
    if ((currDate >= this.dateNow) && (currDate < this.maxDate(this.dateNow))) {
      this.form.disable();
      this.form.value.date += ':00.000Z';
      if (this.form.value) {
        this.reminders.push(this.form.value);
        this.flag = true;
      }
      this.sub = this.reminderService.creationReminder(this.form.value, this.userId).subscribe(
        () => {
          console.log('успех');
          this.flag = false
          this.get();
          this.form.enable();
          this.form.value.note.clear();
        },
        error => {
          console.warn(error);
          this.form.enable();
        }
      )
    } else MaterialService.toast('Невалидная дата')
  }

  delete(id: string) {
    const decision = window.confirm('Вы уверенны, что хотите удалить напоминание?');
    if (decision) {
      this.reminderService.deleteReminder(id, this.userId).subscribe(
        () => {
          this.flag = false;
          this.get();
        },
        error => {
          console.log(error)
        }
      );
    }
  }

  change(reminder: Reminder) {
    this.reminderChange = reminder;
    console.log(reminder.date)
    this.formModal = new FormGroup(
      {
        noteChange: new FormControl(reminder.note, [Validators.required]),
        dateChange: new FormControl(reminder.date.slice(0, -8), [Validators.required])
      }
    );
    console.log('айди текущего напоминания' + this.reminderChange.id)
    this.modal.open();
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy(): void {
    this.modal.destroy();
  }

  doSave() {
    this.reminderChange.note = this.formModal.value.noteChange;
    this.reminderChange.date = this.formModal.value.dateChange;
    console.log('текущий текст' + this.reminderChange.note);
    console.log('текущая дата' + this.reminderChange.date);
    console.log('текущий айди' + this.reminderChange.id)
    const reminder = {
      note: this.reminderChange.note,
      date: this.reminderChange.date

    }
    if (this.reminderChange.id) {
      this.sub = this.reminderService.changeReminder(<Reminder>reminder, this.reminderChange.id, this.userId).subscribe(
        () => {
          console.log('успех');
          // this.timerRemainder();
          this.get();
          this.modal.close();
        },
        error => {
          console.warn(error);
          this.form.enable();
        }
      );

    } else MaterialService.toast('Нет данных')
  }

  onSave() {
    if (this.formModal.value.dateChange.indexOf('Widget') != -1) {
      this.doSave()
    } else {
      this.formModal.value.dateChange += ':00.000Z';
      this.doSave();
    }
  }

  closeModal() {
    this.modal.close();
  }

  doTimer() {
    console.log('текущая дата   :  ' + this.nowDate)
    let nowDateToSeconds = new Date(this.nowDate).getTime();
    let difference: number;
    let str = '';
    for (let rem of this.reminders) {
      let date = new Date(rem.date).getTime();
      difference = date - nowDateToSeconds
      console.log('дата напоминания   :  ' + rem.date)
      console.log('текущая дата (м сек)  :  ' + nowDateToSeconds)
      console.log('дата напоминания (м сек)   :  ' + date)
      console.log('полученное число (м сек)   :  ' + difference)
      if (difference > 0) {
        rem.status = 'none'
        if (difference > 2147483647) {
          console.log('слишком большая разница')
        } else {
          str = rem.note
          setTimeout(() => {
              MaterialService.toast(str)
              rem.status = 'done'
            },
            difference - 32000
          )
        }
      } else {
        // this.status = 'done';
        rem.status = 'done'
      }
    }
  }

  timerRemainder() {
    if (this.nowDate.indexOf('.000Z') != -1) {
      this.doTimer();
    } else {
      this.nowDate += '.000Z';
      this.doTimer()
    }
  }

  getColor(status: string | undefined) {
    return status === 'done' ? '#c8e6c9' : 'none';
  }

  maxDate(date: Date) {
    let result = new Date(date);
    result.setDate(result.getDate() + 24);
    return result;
  }
}

