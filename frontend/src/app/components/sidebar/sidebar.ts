import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { SimConfig, SimStatus } from '../../models/simulation.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit {
  @Output() launch = new EventEmitter<SimConfig>();
  @Output() stop = new EventEmitter<void>();

  form!: FormGroup;
  SimStatus = SimStatus;

  statusSignal = signal<SimStatus>(SimStatus.Idle);

  constructor(private fb: FormBuilder) {}

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
      dep_input: [10000000],
      encaje: [0.10],
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
