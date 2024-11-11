import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ProfileComponent {
  username: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  devices: string[] = []; 
  isEditing: boolean = false; // Add isEditing flag

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { userProfile: any };
    if (state && state.userProfile) {
      this.username = state.userProfile.username;
      this.email = state.userProfile.email;
      this.firstName = state.userProfile.firstName;
      this.lastName = state.userProfile.lastName;
      this.devices = state.userProfile.devices;
    }
  }

  editProfile() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    // Implementar la lógica para guardar el perfil
    console.log('Perfil guardado');
    this.isEditing = false;
  }
}