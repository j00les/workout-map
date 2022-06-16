'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [latitude - longitude]
    this.distance = distance; //in km/h
    this.duration = duration; // in minute
  }
  _setDesc() {
    //prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDesc();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this._setDesc();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

// const run = new Running([-12, 22], 5, 30, 200);
// const cycling = new Cycling([-124, 22], 300, 30, 70
// console.log(run, cycling);

// Whole app architecture
class App {
  #mapEvent;
  #map;
  #workout = [];
  constructor() {
    this._getPosition();
    //event listener
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('cannot detect your location')
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    console.log(this);
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@-${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE; //assigning the event to global variable
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    //helper function
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const positiveNumber = (...inputs) => inputs.every(inp => inp > 0);

    //get form data
    const workoutType = inputType.value;
    const distance = +inputDistance.value; //+input means convert type to number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //running workout
    if (workoutType === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !positiveNumber(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //cycling workout
    if (workoutType === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !positiveNumber(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //render workout map marker
    this._renderWorkoutMarker(workout);

    //render workout on list
    this._renderWorkoutOnList(workout);

    //add new object to workout array
    this.#workout.push(workout);
    console.log(workout);

    //clear input fields
    inputCadence.value =
      inputDistance.value =
      inputElevation.value =
      inputDuration.value =
        '';
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)

      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('yeaman')
      .openPopup();
  }
  _renderWorkoutOnList(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '�‍♂️�' : '��'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${workout.duration}</span>
            <span class="workout__value">24</span>
            <span class="workout__unit">min</span>
          </div>
 `;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }
    if (workout.type === 'cycling') {
      html += ``;
    }
  }
}
const app = new App();
