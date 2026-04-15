import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SimConfig, SimStatus, PresetSummary } from '../../models/simulation.models';
import { PresetService } from '../../services/preset.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit {
  @Output() launch = new EventEmitter<SimConfig>();
  @Output() stop = new EventEmitter<void>();

  form!: FormGroup;
  SimStatus = SimStatus;
  presets: PresetSummary[] = [];

  statusSignal = signal<SimStatus>(SimStatus.Idle);

  constructor(
    private fb: FormBuilder,
    private presetService: PresetService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      score: [0.8],
      validez: [0.9],
      difusion: [0.4],
      velocidad: [0.1],
      max_turnos: [150],
      n_simulaciones: [1],
      n_agentes: [200],
      p_externos: [0.2],
      preset_id: ['default'],
    });

    // Cargar presets de forma segura sin bloquear la UI
    setTimeout(() => this.loadPresets(), 100);
  }

  loadPresets(): void {
    this.presetService.listPresets().subscribe({
      next: (presets) => {
        this.presets = presets;
        console.log('Presets cargados:', presets);
      },
      error: (err) => {
        console.error('Error loading presets:', err);
        // Si falla, usar preset por defecto
        this.presets = [{id: 'default', name: 'Default', description: 'Banco genérico'}];
      }
    });
  }

  setStatus(s: SimStatus): void {
    this.statusSignal.set(s);
  }

  onLaunch(): void {
    this.launch.emit(this.form.value as SimConfig);
  }

  onStop(): void {
    this.stop.emit();
  }

  get isRunning(): boolean {
    return this.statusSignal() === SimStatus.Running;
  }
}
