import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import {
  CreateShipmentRequest,
  GetShipmentsParams,
  Shipment,
  ShipmentDetail,
  ShipmentsListResponse,
  UpdateShipmentStatusRequest,
} from '../models/shipment.models';

@Injectable({ providedIn: 'root' })
export class ShipmentsService {
  private readonly http = inject(HttpClient);

  getShipments(params: GetShipmentsParams): Observable<ShipmentsListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<ShipmentsListResponse>(`${API_URL}/shipments`, {
      params: httpParams,
    });
  }

  createShipment(data: CreateShipmentRequest): Observable<Shipment> {
    return this.http.post<Shipment>(`${API_URL}/shipments`, data);
  }

  getShipmentById(id: string): Observable<ShipmentDetail> {
    return this.http.get<ShipmentDetail>(`${API_URL}/shipments/${id}`);
  }

  updateShipmentStatus(
    id: string,
    data: UpdateShipmentStatusRequest,
  ): Observable<Shipment> {
    return this.http.patch<Shipment>(`${API_URL}/shipments/${id}/status`, data);
  }

  cancelShipment(id: string): Observable<Shipment> {
    return this.http.delete<Shipment>(`${API_URL}/shipments/${id}`);
  }
}
