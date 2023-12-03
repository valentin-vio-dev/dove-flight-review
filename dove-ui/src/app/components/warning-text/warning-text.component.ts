import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-warning-text',
  templateUrl: './warning-text.component.html',
  styleUrls: ['./warning-text.component.scss']
})
export class WarningTextComponent {
  @Input() icon: string;
  @Input() title: string;
  @Input() subtitle: string;

}
