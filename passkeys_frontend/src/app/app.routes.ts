import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthComponent } from './auth/auth.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'home', component: AppComponent },
  { path: 'register', component: RegisterComponent }
];