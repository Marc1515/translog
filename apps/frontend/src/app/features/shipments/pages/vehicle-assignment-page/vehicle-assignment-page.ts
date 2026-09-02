import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { getHttpErrorMessage } from '../../../../core/utils/http-error.util';
import {
  AssignVehiclesResponse,
  Shipment,
} from '../../models/shipment.models';
import { ShipmentsService } from '../../services/shipments.service';

const WAREHOUSE_SHIPMENTS_LIMIT = 100;

@Component({
  selector: 'app-vehicle-assignment-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vehicle-assignment-page.html',
  styleUrl: './vehicle-assignment-page.scss',
})
export class VehicleAssignmentPage implements OnInit {
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = this.fb.group({
    vehicleCapacity: [
      100,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  shipments: Shipment[] = [];
  totalAvailable = 0;
  selectedIds = new Set<string>();

  loadingList = false;
  submitting = false;
  listErrorMessage: string | null = null;
  selectionErrorMessage: string | null = null;
  submitErrorMessage: string | null = null;
  assignmentResult: AssignVehiclesResponse | null = null;
  lastVehicleCapacity: number | null = null;

  ngOnInit(): void {
    this.loadWarehouseShipments();
  }

  loadWarehouseShipments(): void {
    this.loadingList = true;
    this.listErrorMessage = null;

    this.shipmentsService
      .getShipments({
        page: 1,
        limit: WAREHOUSE_SHIPMENTS_LIMIT,
        status: 'IN_WAREHOUSE',
      })
      .pipe(
        finalize(() => {
          this.loadingList = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.shipments = response.data;
          this.totalAvailable = response.meta.total;
          this.pruneSelection();
        },
        error: () => {
          this.listErrorMessage =
            'No se pudieron cargar los envíos en almacén.';
          this.shipments = [];
          this.totalAvailable = 0;
        },
      });
  }

  get showTruncationNote(): boolean {
    return this.totalAvailable > WAREHOUSE_SHIPMENTS_LIMIT;
  }

  get allLoadedSelected(): boolean {
    return (
      this.shipments.length > 0 &&
      this.shipments.every((shipment) => this.selectedIds.has(shipment.id))
    );
  }

  get someLoadedSelected(): boolean {
    return (
      this.shipments.some((shipment) => this.selectedIds.has(shipment.id)) &&
      !this.allLoadedSelected
    );
  }

  get hasWarehouseShipments(): boolean {
    return this.shipments.length > 0;
  }

  isSelected(shipmentId: string): boolean {
    return this.selectedIds.has(shipmentId);
  }

  toggleShipment(shipmentId: string, checked: boolean): void {
    if (checked) {
      this.selectedIds.add(shipmentId);
    } else {
      this.selectedIds.delete(shipmentId);
    }
    this.selectionErrorMessage = null;
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      for (const shipment of this.shipments) {
        this.selectedIds.add(shipment.id);
      }
    } else {
      for (const shipment of this.shipments) {
        this.selectedIds.delete(shipment.id);
      }
    }
    this.selectionErrorMessage = null;
  }

  onSubmit(): void {
    if (this.submitting || this.loadingList) {
      return;
    }

    this.selectionErrorMessage = null;
    this.submitErrorMessage = null;
    this.assignmentResult = null;
    this.lastVehicleCapacity = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.selectedIds.size === 0) {
      this.selectionErrorMessage = 'Selecciona al menos un envío.';
      return;
    }

    const vehicleCapacity = Number(this.form.controls.vehicleCapacity.value);

    if (!Number.isFinite(vehicleCapacity) || vehicleCapacity <= 0) {
      this.form.controls.vehicleCapacity.setErrors({ min: true });
      this.form.controls.vehicleCapacity.markAsTouched();
      return;
    }

    const payload = {
      shipmentIds: [...this.selectedIds],
      vehicleCapacity,
    };

    this.submitting = true;

    this.shipmentsService
      .assignVehicles(payload)
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => {
          this.assignmentResult = result;
          this.lastVehicleCapacity = vehicleCapacity;
        },
        error: (error) => {
          this.submitErrorMessage = getHttpErrorMessage(
            error,
            'No se pudo calcular la asignación de vehículos.',
          );

          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.loadWarehouseShipmentsAfterConflict();
          }
        },
      });
  }

  private loadWarehouseShipmentsAfterConflict(): void {
    this.shipmentsService
      .getShipments({
        page: 1,
        limit: WAREHOUSE_SHIPMENTS_LIMIT,
        status: 'IN_WAREHOUSE',
      })
      .subscribe({
        next: (response) => {
          this.shipments = response.data;
          this.totalAvailable = response.meta.total;
          this.pruneSelection();
          this.cdr.markForCheck();
        },
      });
  }

  private pruneSelection(): void {
    const validIds = new Set(this.shipments.map((shipment) => shipment.id));
    for (const id of this.selectedIds) {
      if (!validIds.has(id)) {
        this.selectedIds.delete(id);
      }
    }
  }
}
