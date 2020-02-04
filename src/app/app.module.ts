import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TruncatePipe } from 'angular-pipes';

import { environment, Environment } from '@app/env';

import { YoutubeService, PersistentStorageService, STORAGE_TOKEN as NATIVE_STORAGE_TOKEN } from './services';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
  ],
  declarations: [
    AppComponent,
    TruncatePipe,
  ],
  providers: [
    YoutubeService,
    PersistentStorageService,
    {
      provide: Environment,
      useValue: environment,
    },
    {
      provide: NATIVE_STORAGE_TOKEN,
      useValue: localStorage,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
