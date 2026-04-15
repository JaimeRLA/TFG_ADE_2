import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PresetSummary, PresetData } from '../models/simulation.models';

@Injectable({
  providedIn: 'root'
})
export class PresetService {
  private apiUrl = 'http://localhost:8000/api/presets';

  constructor(private http: HttpClient) {}

  listPresets(): Observable<PresetSummary[]> {
    return this.http.get<PresetSummary[]>(this.apiUrl);
  }

  getPreset(id: string): Observable<PresetData> {
    return this.http.get<PresetData>(`${this.apiUrl}/${id}`);
  }

  createPreset(preset: PresetData): Observable<{id: string, message: string}> {
    return this.http.post<{id: string, message: string}>(this.apiUrl, preset);
  }

  updatePreset(id: string, preset: PresetData): Observable<{id: string, message: string}> {
    return this.http.put<{id: string, message: string}>(`${this.apiUrl}/${id}`, preset);
  }

  deletePreset(id: string): Observable<{id: string, message: string}> {
    return this.http.delete<{id: string, message: string}>(`${this.apiUrl}/${id}`);
  }
}
