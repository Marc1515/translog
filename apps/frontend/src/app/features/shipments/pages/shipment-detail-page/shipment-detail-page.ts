import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, finalize } from 'rxjs';
import { UserRole } from '../../../auth/models/auth.models';
import { getHttpErrorMessage } from '../../../../core/utils/http-error.util';
import {
  ShipmentDetail,
  ShipmentEvent,
  ShipmentStatus,
  UpdateShipmentStatusRequest,
} from '../../models/shipment.models';
import { ShipmentsService } from '../../services/shipments.service';
import { SHIPMENT_STATUS_LABELS } from '../../utils/shipment-status.util';
import {
  canCancelShipment,
  getAllowedTransitions,
  isTerminalStatus,
} from '../../utils/shipment-transitions.util';

const USER_ROLE_LABELS: Record<UserRole, string> = {
  OPERATOR: 'Operador',
  SUPERVISOR: 'Supervisor',
};

@Component({
  selector: 'app-shipment-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './shipment-detail-page.html',
  styleUrl: './shipment-detail-page.scss',
})
export class ShipmentDetailPage implements OnInit, OnDestroy {
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  private routeSub?: Subscription;
  private shipmentId: string | null = null;

  readonly statusLabels = SHIPMENT_STATUS_LABELS;
  readonly roleLabels = USER_ROLE_LABELS;

  readonly statusForm = this.fb.group({
    status: ['' as ShipmentStatus | '', Validators.required],
    location: ['', Validators.required],
    notes: [''],
  });

  shipment: ShipmentDetail | null = null;
  loadingInitial = false;
  errorMessage: string | null = null;
  notFound = false;
  loadingUpdate = false;
  updateErrorMessage: string | null = null;
  loadingCancel = false;
  cancelErrorMessage: string | null = null;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.shipmentId = id;
        this.loadShipment();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadShipment(): void {
    if (!this.shipmentId) {
      return;
    }

    this.loadingInitial = true;
    this.errorMessage = null;
    this.notFound = false;
    this.shipment = null;
    this.resetStatusForm();
    this.updateErrorMessage = null;
    this.cancelErrorMessage = null;

    this.shipmentsService
      .getShipmentById(this.shipmentId)
      .pipe(
        finalize(() => {
          this.loadingInitial = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (detail) => {
          this.shipment = detail;
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.notFound = true;
            this.errorMessage = 'Envío no encontrado.';
          } else {
            this.errorMessage = 'No se pudo cargar el envío.';
          }
        },
      });
  }

  retry(): void {
    this.loadShipment();
  }

  getStatusLabel(status: ShipmentStatus): string {
    return this.statusLabels[status];
  }

  getRoleLabel(role: UserRole): string {
    return this.roleLabels[role];
  }

  get allowedTransitions(): ShipmentStatus[] {
    if (!this.shipment) {
      return [];
    }
    return getAllowedTransitions(this.shipment.status);
  }

  get canCancel(): boolean {
    if (!this.shipment) {
      return false;
    }
    return canCancelShipment(this.shipment.status);
  }

  get isTerminal(): boolean {
    if (!this.shipment) {
      return false;
    }
    return isTerminalStatus(this.shipment.status);
  }

  get showStatusForm(): boolean {
    return !!this.shipment && this.allowedTransitions.length > 0;
  }

  onSubmitStatusUpdate(): void {
    if (!this.shipmentId || this.loadingUpdate) {
      return;
    }

    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    const raw = this.statusForm.getRawValue();
    const payload: UpdateShipmentStatusRequest = {
      status: raw.status as ShipmentStatus,
      location: raw.location!.trim(),
    };

    const notes = raw.notes?.trim();
    if (notes) {
      payload.notes = notes;
    }

    this.loadingUpdate = true;
    this.updateErrorMessage = null;

    this.shipmentsService
      .updateShipmentStatus(this.shipmentId, payload)
      .pipe(
        finalize(() => {
          this.loadingUpdate = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Estado actualizado correctamente.', 'Cerrar', {
            duration: 4000,
          });
          this.resetStatusForm();
          this.loadShipment();
        },
        error: (error) => {
          this.updateErrorMessage = getHttpErrorMessage(
            error,
            'No se pudo actualizar el estado.',
          );
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.loadShipment();
          }
        },
      });
  }

  onCancelShipment(): void {
    if (!this.shipmentId || this.loadingCancel || !this.canCancel) {
      return;
    }

    const confirmed = window.confirm(
      '¿Seguro que quieres cancelar este envío?',
    );
    if (!confirmed) {
      return;
    }

    this.loadingCancel = true;
    this.cancelErrorMessage = null;

    this.shipmentsService
      .cancelShipment(this.shipmentId)
      .pipe(
        finalize(() => {
          this.loadingCancel = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Envío cancelado correctamente.', 'Cerrar', {
            duration: 4000,
          });
          this.loadShipment();
        },
        error: (error) => {
          this.cancelErrorMessage = getHttpErrorMessage(
            error,
            'No se pudo cancelar el envío.',
          );
        },
      });
  }

  formatPhone(phone: string | null): string {
    return phone ?? 'No indicado';
  }

  hasEventLocation(event: ShipmentEvent): boolean {
    return !!event.location?.trim();
  }

  hasEventNotes(event: ShipmentEvent): boolean {
    return !!event.notes?.trim();
  }

  private resetStatusForm(): void {
    this.statusForm.reset({
      status: '',
      location: '',
      notes: '',
    });
  }
}
