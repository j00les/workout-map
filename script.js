'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    position => {
      const latitude = position.coords.latitude;
      const { longitude } = position.coords;
      console.log(`https://www.google.com/maps/@-${latitude},${longitude}`);
      const coords = [latitude, longitude];
      const map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', e => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 200,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('yea man')
          .openPopup();
      });
    },

    () => alert('cannot detect your location')
  );
