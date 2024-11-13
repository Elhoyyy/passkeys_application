import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { fido2Get } from '@ownid/webauthn';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule]
})
export class AuthComponent {
  username: string = '';
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  async login() {
    this.errorMessage = null;
    try {
      const response = await this.http.post('/login/inicio', { username: this.username }).toPromise();
      const options = response as PublicKeyCredentialRequestOptions;
      console.log('Options:', options);
      if (!options) {
        this.errorMessage = 'No se pudo obtener el desafío de autenticación.';
        console.log('No se pudo obtener el desafío de autenticación.');
        return;
      }
      console.log(this.username);
      try {
        if (!options.challenge) {
          throw new Error('Challenge is undefined');
        }
        const assertion = await fido2Get(options, this.username);
        const loginResponse = await this.http.post<{ res: boolean, redirectUrl?: string, userProfile?: any }>('/login/fin', assertion).toPromise();
        console.log('Assertion:', assertion);
        console.log('Login response:', loginResponse);
        if (loginResponse && loginResponse.res) {
          console.log('Login successful:', loginResponse);
          if (loginResponse.redirectUrl) {
            this.router.navigate([loginResponse.redirectUrl], { state: { userProfile: loginResponse.userProfile } });
          } else {
            this.router.navigate(['/profile'], { state: { userProfile: loginResponse.userProfile } });
          }
        } else {
          this.errorMessage = 'Error en la respuesta del inicio de sesión.';
        }
      } catch (fidoError) {
        console.error('Error in fido2Get:', fidoError);
        this.errorMessage = 'Error en el proceso de autenticación. Intenta nuevamente.';
      }
    } catch (error) {
      console.log('Error de inicio de sesión:', error);
      console.error('Error en el proceso de inicio de sesión:', error);
      this.errorMessage = 'Error en el inicio de sesión. Intenta nuevamente.';
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
    auth() {
    this.router.navigate(['/auth']);
  }

}
