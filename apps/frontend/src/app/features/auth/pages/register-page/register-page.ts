import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { UserRole } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { getHttpErrorMessage } from '../../../../core/utils/http-error.util';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly roles: UserRole[] = ['OPERATOR', 'SUPERVISOR'];

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['OPERATOR' as UserRole, Validators.required],
  });

  loading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.loading) {
      return;
    }

    const raw = this.form.getRawValue();
    const email = raw.email.trim();

    if (!email) {
      this.form.controls.email.setErrors({ required: true });
      this.form.controls.email.markAsTouched();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService
      .register({ ...raw, email })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.snackBar.open('Usuario registrado correctamente.', 'Cerrar', {
            duration: 4000,
          });
          this.form.reset({
            email: '',
            password: '',
            role: 'OPERATOR',
          });
        },
        error: (error: unknown) => {
          this.errorMessage = getHttpErrorMessage(
            error,
            'No se pudo registrar el usuario.',
          );
        },
      });
  }
}
