import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { PresetService } from '../../services/preset.service';
import { PresetSummary, PresetData } from '../../models/simulation.models';

@Component({
  selector: 'app-preset-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSliderModule,
  ],
  templateUrl: './preset-manager.html',
  styleUrl: './preset-manager.scss',
})
export class PresetManagerComponent implements OnInit {
  presets: PresetSummary[] = [];
  selectedPresetId: string | null = null;
  presetForm!: FormGroup;
  isNewPreset = false;
  isEditing = false;
  isLoading = false;
  loadError = false;
  isLoadingPreset = false;
  loadPresetError = false;

  constructor(
    private fb: FormBuilder,
    private presetService: PresetService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPresets();
  }

  initForm(): void {
    this.presetForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      // Demographics
      edad_media: [50],
      edad_desviacion: [18],
      edad_minima: [18],
      edad_maxima: [90],
      factor_h: [1.1],
      factor_m: [1.0],
      // Deposit Guarantee
      umbral_fgd: [100000],
      reduccion_panico_fgd: [0.5],
      // Loyalty
      fidelidad_min: [0.1],
      fidelidad_max: [0.9],
      // Balances
      saldo_retail_min: [1000],
      saldo_retail_max: [15000],
      saldo_vip_min: [20000],
      saldo_vip_max: [100000],
      saldo_empresa_min: [50000],
      saldo_empresa_max: [200000],
      prob_retail: [0.75],
      prob_vip: [0.20],
      prob_empresa: [0.05],
      // Behavior
      k_ruido_cliente: [10],
      x0_cliente: [0.4],
      k_ruido_no_cliente: [12],
      x0_no_cliente: [0.45],
      // Decision Weights
      peso_noticia: [0.4],
      peso_social: [0.5],
      peso_liquidez: [0.1],
      // Market
      poblacion_objetivo: [3000000],
      // Network
      red_enlaces_nuevos: [3],
      red_prob_triangulo: [0.5],
      // Bank Structure
      total_depositos: [200000000000],
      liquidez_inicial: [0.07],
    });
  }

  loadPresets(): void {
    this.isLoading = true;
    this.loadError = false;
    console.log('Iniciando carga de presets...');
    this.presetService.listPresets().subscribe({
      next: (presets) => {
        console.log('Presets recibidos:', presets);
        this.presets = presets;
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('Presets cargados:', presets);
        console.log('isLoading:', this.isLoading);
      },
      error: (err) => {
        console.error('Error cargando presets:', err);
        this.loadError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Error cargando presets', 'Cerrar', { duration: 3000 });
      }
    });
  }

  selectPreset(id: string): void {
    this.selectedPresetId = id;
    this.isNewPreset = false;
    this.isEditing = true;
    this.isLoadingPreset = true;
    this.loadPresetError = false;
    this.cdr.detectChanges();

    console.log('Cargando preset:', id);
    this.presetService.getPreset(id).subscribe({
      next: (preset) => {
        console.log('Preset cargado exitosamente:', preset);
        this.loadPresetToForm(preset);
        this.isLoadingPreset = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando preset:', err);
        this.isLoadingPreset = false;
        this.loadPresetError = true;
        this.cdr.detectChanges();
        this.snackBar.open(`Error cargando preset: ${err.message}`, 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadPresetToForm(preset: PresetData): void {
    this.presetForm.patchValue({
      name: preset.name,
      description: preset.description,
      edad_media: preset.demographics.edad_media,
      edad_desviacion: preset.demographics.edad_desviacion,
      edad_minima: preset.demographics.edad_minima,
      edad_maxima: preset.demographics.edad_maxima,
      factor_h: preset.demographics.factor_h,
      factor_m: preset.demographics.factor_m,
      umbral_fgd: preset.deposit_guarantee.umbral_fgd,
      reduccion_panico_fgd: preset.deposit_guarantee.reduccion_panico_fgd,
      fidelidad_min: preset.loyalty.rango_fidelidad[0],
      fidelidad_max: preset.loyalty.rango_fidelidad[1],
      saldo_retail_min: preset.balances.saldo_retail_rango[0],
      saldo_retail_max: preset.balances.saldo_retail_rango[1],
      saldo_vip_min: preset.balances.saldo_vip_rango[0],
      saldo_vip_max: preset.balances.saldo_vip_rango[1],
      saldo_empresa_min: preset.balances.saldo_empresa_rango[0],
      saldo_empresa_max: preset.balances.saldo_empresa_rango[1],
      prob_retail: preset.balances.probabilidades_tipos[0],
      prob_vip: preset.balances.probabilidades_tipos[1],
      prob_empresa: preset.balances.probabilidades_tipos[2],
      k_ruido_cliente: preset.behavior.k_ruido_cliente,
      x0_cliente: preset.behavior.x0_cliente,
      k_ruido_no_cliente: preset.behavior.k_ruido_no_cliente,
      x0_no_cliente: preset.behavior.x0_no_cliente,
      peso_noticia: preset.decision_weights.peso_noticia,
      peso_social: preset.decision_weights.peso_social,
      peso_liquidez: preset.decision_weights.peso_liquidez,
      poblacion_objetivo: preset.market.poblacion_objetivo,
      red_enlaces_nuevos: preset.network.red_enlaces_nuevos,
      red_prob_triangulo: preset.network.red_prob_triangulo,
      total_depositos: preset.bank_structure.total_depositos,
      liquidez_inicial: preset.bank_structure.liquidez_inicial,
    });
  }

  newPreset(): void {
    this.isNewPreset = true;
    this.isEditing = true;
    this.selectedPresetId = null;
    this.presetForm.reset();
    this.initForm();
  }

  savePreset(): void {
    if (this.presetForm.invalid) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const formValue = this.presetForm.value;
    const preset: PresetData = {
      name: formValue.name,
      description: formValue.description || '',
      demographics: {
        edad_media: formValue.edad_media,
        edad_desviacion: formValue.edad_desviacion,
        edad_minima: formValue.edad_minima,
        edad_maxima: formValue.edad_maxima,
        distribucion_sexo: ['H', 'M'],
        probabilidades_sexo: [0.5, 0.5],
        factor_h: formValue.factor_h,
        factor_m: formValue.factor_m,
      },
      deposit_guarantee: {
        umbral_fgd: formValue.umbral_fgd,
        reduccion_panico_fgd: formValue.reduccion_panico_fgd,
      },
      loyalty: {
        rango_fidelidad: [formValue.fidelidad_min, formValue.fidelidad_max],
      },
      balances: {
        saldo_retail_rango: [formValue.saldo_retail_min, formValue.saldo_retail_max],
        saldo_vip_rango: [formValue.saldo_vip_min, formValue.saldo_vip_max],
        saldo_empresa_rango: [formValue.saldo_empresa_min, formValue.saldo_empresa_max],
        distribucion_tipos: ['Retail', 'VIP', 'Empresa'],
        probabilidades_tipos: [formValue.prob_retail, formValue.prob_vip, formValue.prob_empresa],
      },
      behavior: {
        k_ruido_cliente: formValue.k_ruido_cliente,
        x0_cliente: formValue.x0_cliente,
        k_ruido_no_cliente: formValue.k_ruido_no_cliente,
        x0_no_cliente: formValue.x0_no_cliente,
      },
      decision_weights: {
        peso_noticia: formValue.peso_noticia,
        peso_social: formValue.peso_social,
        peso_liquidez: formValue.peso_liquidez,
      },
      market: {
        poblacion_objetivo: formValue.poblacion_objetivo,
      },
      network: {
        red_enlaces_nuevos: formValue.red_enlaces_nuevos,
        red_prob_triangulo: formValue.red_prob_triangulo,
      },
      bank_structure: {
        total_depositos: formValue.total_depositos,
        liquidez_inicial: formValue.liquidez_inicial,
      },
    };

    if (this.isNewPreset) {
      this.presetService.createPreset(preset).subscribe({
        next: (response) => {
          this.snackBar.open('Preset creado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadPresets();
          this.isEditing = false;
          this.isNewPreset = false;
        },
        error: (err) => {
          this.snackBar.open('Error creando preset', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    } else if (this.selectedPresetId) {
      this.presetService.updatePreset(this.selectedPresetId, preset).subscribe({
        next: (response) => {
          this.snackBar.open('Preset actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadPresets();
        },
        error: (err) => {
          this.snackBar.open('Error actualizando preset', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  deletePreset(id: string): void {
    if (!confirm('¿Está seguro de que desea eliminar este preset?')) {
      return;
    }

    this.presetService.deletePreset(id).subscribe({
      next: (response) => {
        this.snackBar.open('Preset eliminado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadPresets();
        if (this.selectedPresetId === id) {
          this.selectedPresetId = null;
          this.isEditing = false;
        }
      },
      error: (err) => {
        this.snackBar.open('Error eliminando preset', 'Cerrar', { duration: 3000 });
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.isEditing = false;
    this.isNewPreset = false;
    this.selectedPresetId = null;
  }
}
