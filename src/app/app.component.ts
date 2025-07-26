import { Component } from '@angular/core';
import { FaceMeshComponent } from './face-mesh/face-mesh';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FaceMeshComponent],
  template: `<app-face-mesh></app-face-mesh>`
})
export class AppComponent {}