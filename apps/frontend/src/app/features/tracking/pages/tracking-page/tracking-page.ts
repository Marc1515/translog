import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-tracking-page',
  imports: [RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './tracking-page.html',
  styleUrl: './tracking-page.scss',
})
export class TrackingPage {}
