import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherComponent } from './weather.component';

describe('WeatherComponent', () => {
  let component: WeatherComponent;
  let fixture: ComponentFixture<WeatherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('weatherApp.cityId');
    localStorage.removeItem('weatherApp.units');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    fixture.detectChanges();

    expect(component.city).toBe('');
    expect(component.cities.length).toBe(0);
    expect(component.cityId).toBe('');
    expect(component.units).toBe('metric');
    expect(component.weather).toBeUndefined();
    expect(component.errorMessage).toBe('');
  });

  it('should toggle units', async () => {
    const initialUnits = component.units;

    await component.toggleUnits();

    expect(component.units).not.toBe(initialUnits);
  });

  it('should fetch weather data by city name', async () => {
    component.city = 'New York City';
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ list: [{ name: 'New York City' }] })
    } as Response));

    await component.getWeatherByCityName();
    fixture.detectChanges();

    expect(window.fetch).toHaveBeenCalled();
    expect(component.cities.length).toBe(0);
    expect(component.errorMessage).toBe('');
  });

  it('should handle error when fetching weather data by city name fails', async () => {
    component.city = 'NonExistingCity';
    spyOn(window, 'fetch').and.returnValue(Promise.reject('Error'));

    await component.getWeatherByCityName();
    fixture.detectChanges();

    await fixture.whenStable();

    expect(window.fetch).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Error fetching weather data. Please try again later.');
    expect(component.weather).toBeNull();
  });
});
