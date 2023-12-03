import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule} from '@angular/material/icon';
import { MatGridListModule} from '@angular/material/grid-list';
import { MapComponent } from './components/map/map.component';
import { MatButtonModule} from '@angular/material/button';
import { MatSliderModule} from '@angular/material/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VideoComponent } from './components/video/video.component';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatCardModule} from '@angular/material/card';
import { MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { OpenDataListBsheetComponent } from './components/open-data-list-bsheet/open-data-list-bsheet.component';
import { MatListModule} from '@angular/material/list';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { RawDataComponent } from './components/raw-data/raw-data.component';
import { DddViewComponent } from './components/ddd-view/ddd-view.component';
import { WarningTextComponent } from './components/warning-text/warning-text.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    VideoComponent,
    OpenDataListBsheetComponent,
    RawDataComponent,
    DddViewComponent,
    WarningTextComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatGridListModule,
    MatButtonModule,
    MatSliderModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatBottomSheetModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
