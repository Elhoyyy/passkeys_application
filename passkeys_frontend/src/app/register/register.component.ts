import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { fido2Create } from '@ownid/webauthn';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  deviceName: string = ''; // Add deviceName field
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }


  async registro() {
    this.errorMessage = null;
    try {
      const publicKey = await this.http.post('/registro/inicio', { 
        username: this.username, 
        firstName: this.firstName, 
        lastName: this.lastName, 
        email: this.email 
      }).toPromise();
      const fidoData = await fido2Create(publicKey, this.username);
      const response = await this.http.post<boolean>('/registro/fin', { 
        ...fidoData, 
        username: this.username, 
        firstName: this.firstName, 
        lastName: this.lastName, 
        email: this.email,
        deviceName: this.deviceName // Send deviceName
      }).toPromise();
      console.log('Registro exitoso:', response);
      if (response) {
        this.router.navigate(['/profile'], { state: { userProfile: { username: this.username, firstName: this.firstName, lastName: this.lastName, email: this.email, devices: [this.deviceName] } } });
      }
    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      this.errorMessage = 'Error en el registro. Intenta nuevamente.';
    }
  }
  
  auth() {
    this.router.navigate(['/auth']);
  }

}
