import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RemindComponent } from './shared/remind.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Loader } from './shared/loader/loader';

@NgModule({
  declarations: [
    AppComponent,
    RemindComponent,
    Loader,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
