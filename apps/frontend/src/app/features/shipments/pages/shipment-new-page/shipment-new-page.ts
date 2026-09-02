import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { CreateShipmentRequest } from '../../models/shipment.models';
import { ShipmentsService } from '../../services/shipments.service';

@Component({
  selector: 'app-shipment-new-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './shipment-new-page.html',
  styleUrl: './shipment-new-page.scss',
})
export class ShipmentNewPage {
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = this.fb.group({
    originAddress: ['', Validators.required],
    destinationAddress: ['', Validators.required],
    recipientName: ['', Validators.required],
    contactPhone: [''],
    weight: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  loading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const weight = Number(raw.weight);

    if (!Number.isFinite(weight) || weight <= 0) {
      this.form.controls.weight.setErrors({ min: true });
      this.form.controls.weight.markAsTouched();
      return;
    }

    const payload: CreateShipmentRequest = {
      originAddress: raw.originAddress!.trim(),
      destinationAddress: raw.destinationAddress!.trim(),
      recipientName: raw.recipientName!.trim(),
      weight,
    };

    const phone = raw.contactPhone?.trim();
    if (phone) {
      payload.contactPhone = phone;
    }

    this.loading = true;
    this.errorMessage = null;

    this.shipmentsService
      .createShipment(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (shipment) => {
          this.snackBar.open(
            `Envío creado correctamente: ${shipment.trackingCode}`,
            'Cerrar',
            { duration: 4000 },
          );
          void this.router.navigate(['/shipments']);
        },
        error: () => {
          this.errorMessage = 'No se pudo crear el envío.';
        },
      });
  }

  cancel(): void {
    void this.router.navigate(['/shipments']);
  }
}
