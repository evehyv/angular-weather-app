import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css'
})
export class WeatherComponent {
  private apiKey: string = 'API_KEY';
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5/';
  city: string = '';
  cities: any[] = [];
  cityId: string = '';
  units: string = 'metric';
  weather: any;
  errorMessage: string = '';

  constructor() {}

  ngOnInit(): void {
    // Load city and units from localStorage if available
    const savedCityId = localStorage.getItem('weatherApp.cityId');
    const savedUnits = localStorage.getItem('weatherApp.units');

    if (savedUnits) {
      this.units = savedUnits;
    }
    if (savedCityId) {
      this.cityId = savedCityId;
      this.getWeatherByCityId(this.cityId); // Fetch weather data for the saved city
    }
  }

  getWeatherByCityName() {
    if (this.city) {
      const url = `${this.baseUrl}find?q=${this.city}&units=${this.units}&appid=${this.apiKey}`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.count === 0) {
            this.errorMessage = `No results found for ${this.city}. Please try again.`;
            this.weather = null;
            this.cities = [];
            this.cityId = '';
          } else if (data.count === 1) {
            // Only one city found, fetch weather for this city
            this.weather = data.list[0];
            this.errorMessage = '';
            this.cities = [];
            this.cityId = '';
            // Save selected city and units to localStorage
            this.saveToLocalStorage(data.list[0].id);
          } else {
            // Multiple cities found, prompt user to select one
            this.cities = data.list;
            this.errorMessage = `Multiple cities found for "${this.city}". Please select one.`;
            this.weather = null;
          }
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
          this.errorMessage = 'Error fetching weather data. Please try again later.';
          this.weather = null;
          this.cities = [];
          this.cityId = '';
        });
    } else {
      this.errorMessage = 'Please enter a city name.';
      this.weather = null;
      this.cities = [];
      this.cityId = '';
    }
  }

  getWeatherByCityId(cityId: string) {
    this.cityId = cityId;
    const url = `${this.baseUrl}weather?id=${cityId}&units=${this.units}&appid=${this.apiKey}`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.weather = data;
        this.errorMessage = '';
        this.cities = [];

        // Save selected city and units to localStorage
        this.saveToLocalStorage(cityId);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        this.errorMessage = 'Error fetching weather data. Please try again later.';
        this.weather = null;
        this.cities = [];
      });
  }

  toggleUnits() {
    this.units = this.units === 'metric' ? 'imperial' : 'metric';
    if (this.cityId) {
      this.getWeatherByCityId(this.cityId);
    } else if (this.city) {
      this.getWeatherByCityName();
    }

    // Save selected units to localStorage
    localStorage.setItem('weatherApp.units', this.units);
  }

  private saveToLocalStorage(cityId: string) {
    localStorage.setItem('weatherApp.cityId', cityId);
    localStorage.setItem('weatherApp.units', this.units);
  }
}
