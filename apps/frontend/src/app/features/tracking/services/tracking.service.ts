import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { PublicTrackingResponse } from '../models/public-tracking.models';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly http = inject(HttpClient);

  trackShipment(trackingCode: string): Observable<PublicTrackingResponse> {
    return this.http.get<PublicTrackingResponse>(
      `${API_URL}/tracking/${encodeURIComponent(trackingCode)}`,
    );
  }
}
