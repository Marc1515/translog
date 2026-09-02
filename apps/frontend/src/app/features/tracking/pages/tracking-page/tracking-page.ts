import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { finalize } from 'rxjs';
import { getHttpErrorMessage } from '../../../../core/utils/http-error.util';
import {
  PublicTrackingEvent,
  PublicTrackingResponse,
} from '../../models/public-tracking.models';
import { TrackingService } from '../../services/tracking.service';
import { ShipmentStatus } from '../../../shipments/models/shipment.models';
import { SHIPMENT_STATUS_LABELS } from '../../../shipments/utils/shipment-status.util';

const NOT_FOUND_MESSAGE =
  'No se encontró ningún envío con este código de seguimiento.';

@Component({
  selector: 'app-tracking-page',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tracking-page.html',
  styleUrl: './tracking-page.scss',
})
export class TrackingPage {
  private readonly trackingService = inject(TrackingService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly statusLabels = SHIPMENT_STATUS_LABELS;

  readonly searchForm = this.fb.group({
    trackingCode: ['', Validators.required],
  });

  loading = false;
  result: PublicTrackingResponse | null = null;
  errorMessage: string | null = null;

  getStatusLabel(status: ShipmentStatus): string {
    return this.statusLabels[status];
  }

  hasEventLocation(event: PublicTrackingEvent): boolean {
    return event.location != null && event.location.trim() !== '';
  }

  hasEventNotes(event: PublicTrackingEvent): boolean {
    return event.notes != null && event.notes.trim() !== '';
  }

  onSearch(): void {
    if (this.loading) {
      return;
    }

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const rawCode = this.searchForm.controls.trackingCode.value ?? '';
    const trackingCode = rawCode.trim().toUpperCase();

    if (!trackingCode) {
      this.searchForm.controls.trackingCode.setErrors({ required: true });
      this.searchForm.controls.trackingCode.markAsTouched();
      return;
    }

    this.loading = true;
    this.result = null;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.trackingService
      .trackShipment(trackingCode)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.result = response;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.errorMessage = this.resolveErrorMessage(error);
          this.cdr.markForCheck();
        },
      });
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return NOT_FOUND_MESSAGE;
    }

    return getHttpErrorMessage(error);
  }
}
