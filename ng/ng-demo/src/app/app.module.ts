import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms'

import { AppComponent } from './app.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { HeroParentComponent } from './hero-parent/hero-parent.component';
import { HeroChildComponent } from './hero-child/hero-child.component';
import { VoterComponent } from './voter/voter.component';
import { VotetakerComponent } from './votetaker/votetaker.component';
import {HighLightDirective} from './directive/highlight.directive';
import {MyFormComponent} from './forms/my-form/my-form.component'

@NgModule({
  declarations: [
    AppComponent,
    HeroListComponent,
    HeroParentComponent,
    HeroChildComponent,
    VoterComponent,
    VotetakerComponent,
    HighLightDirective,
    MyFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
