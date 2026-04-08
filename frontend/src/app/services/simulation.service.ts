import { Injectable, NgZone } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { SimConfig, SimMessage, SimStatus } from '../models/simulation.models';

const CONNECT_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private ws: WebSocket | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  readonly messages$ = new Subject<SimMessage>();
  readonly status$ = new BehaviorSubject<SimStatus>(SimStatus.Idle);
  readonly errorMsg$ = new BehaviorSubject<string>('');

  constructor(private zone: NgZone) {}

  start(config: SimConfig): void {
    this.stop();
    this.zone.run(() => {
      this.status$.next(SimStatus.Running);
      this.errorMsg$.next('');
    });

    // WebSocket se crea FUERA de la zona para no bloquear,
    // pero cada callback se ejecuta DENTRO con zone.run()
    this.zone.runOutsideAngular(() => {
      this.ws = new WebSocket('ws://localhost:8000/ws/simulate');

      this.connectTimer = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          this.zone.run(() => {
            this.errorMsg$.next(
              'No se pudo conectar al backend. Asegúrate de ejecutar: uvicorn backend.main:app --reload',
            );
            this.status$.next(SimStatus.Error);
          });
        }
      }, CONNECT_TIMEOUT_MS);

      this.ws.onopen = () => {
        this._clearTimer();
        this.ws!.send(JSON.stringify(config));
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const msg: SimMessage = JSON.parse(event.data as string);
          this.zone.run(() => {
            this.messages$.next(msg);
            if (msg.type === 'report') this.status$.next(SimStatus.Done);
            if (msg.type === 'error') {
              this.errorMsg$.next((msg as { type: 'error'; message: string }).message);
              this.status$.next(SimStatus.Error);
            }
          });
        } catch (e) {
          console.error('Error parsing WebSocket message', e);
        }
      };

      this.ws.onerror = () => {
        this._clearTimer();
        this.zone.run(() => {
          this.errorMsg$.next(
            'Error de conexión. Verifica que el backend esté corriendo en localhost:8000',
          );
          this.status$.next(SimStatus.Error);
        });
      };

      this.ws.onclose = () => {
        this._clearTimer();
        this.zone.run(() => {
          if (this.status$.getValue() === SimStatus.Running) {
            this.status$.next(SimStatus.Idle);
          }
        });
      };
    });
  }

  stop(): void {
    this._clearTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.zone.run(() => {
      this.status$.next(SimStatus.Idle);
      this.errorMsg$.next('');
    });
  }

  private _clearTimer(): void {
    if (this.connectTimer !== null) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }
}
