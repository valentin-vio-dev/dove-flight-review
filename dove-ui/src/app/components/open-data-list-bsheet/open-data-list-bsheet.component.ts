import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-open-data-list-bsheet',
  templateUrl: './open-data-list-bsheet.component.html',
  styleUrls: ['./open-data-list-bsheet.component.scss']
})
export class OpenDataListBsheetComponent {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<OpenDataListBsheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  onFileOsd(event: any) {
    this.bottomSheetRef.dismiss({ type: 'OSD', file: event.target.files[0] });
  }

  onFileVid(event: any) {
    this.bottomSheetRef.dismiss({ type: 'VID', file: event.target.files[0] });
  }
}
