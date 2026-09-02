import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { Shipment, ShipmentStatus } from '../../models/shipment.models';
import { ShipmentsService } from '../../services/shipments.service';
import {
  SHIPMENT_STATUS_LABELS,
  STATUS_FILTER_OPTIONS,
  StatusFilter,
} from '../../utils/shipment-status.util';

@Component({
  selector: 'app-shipments-page',
  imports: [
    DatePipe,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './shipments-page.html',
  styleUrl: './shipments-page.scss',
})
export class ShipmentsPage implements OnInit {
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns = [
    'trackingCode',
    'recipientName',
    'destinationAddress',
    'status',
    'createdAt',
    'actions',
  ];
  readonly statusLabels = SHIPMENT_STATUS_LABELS;
  readonly statusOptions = STATUS_FILTER_OPTIONS;

  shipments: Shipment[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  statusFilter: StatusFilter = 'ALL';

  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.loading = true;
    this.errorMessage = null;

    const params = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      ...(this.statusFilter !== 'ALL' ? { status: this.statusFilter } : {}),
    };

    this.shipmentsService
      .getShipments(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.shipments = response.data;
          this.totalItems = response.meta.total;
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar los envíos.';
          this.shipments = [];
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadShipments();
  }

  onStatusFilterChange(event: MatSelectChange<StatusFilter>): void {
    this.statusFilter = event.value;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadShipments();
  }

  retry(): void {
    this.loadShipments();
  }

  getStatusLabel(status: ShipmentStatus): string {
    return this.statusLabels[status];
  }

  get emptyMessage(): string {
    return this.statusFilter !== 'ALL'
      ? 'No hay envíos con este estado.'
      : 'No hay envíos disponibles.';
  }
}
