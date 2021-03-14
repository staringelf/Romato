import { $, $$ } from './bling';

const storeFormApp =  {
  init () {
    if(!$('.form--restaurant')) return;
    this.addressInput = $('.form--restaurant')['location[address]'];
    this.longitudeInput = $('.form--restaurant')['location[coordinates][0]'];
    this.latitudeInput = $('.form--restaurant')['location[coordinates][1]'];
    if(!this.addressInput || !this.longitudeInput)
      return;
    this.setupEventListeners();
  },

  setupEventListeners () {
    const fetchCoords = this.fetchCoords.bind(this);
    this.addressInput.on('blur', fetchCoords);
  },

  fetchCoords({ target }) {
    const query = target.value;
    const endpoint = `https://geocode.search.hereapi.com/v1/geocode?q=${query}&apiKey=_xnhwmiBDL1j8TXuF5iJ0UNj91j4OzqrLKXtswUDeI8`;
    
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        this.coords = data.items[0].position;
        this.fillCoords(this.coords);
      })
      .catch(err => console.log(err));
  },  

  fillCoords (coords) {
    const { lat, lng } = coords;
    this.latitudeInput.value = lat;
    this.longitudeInput.value = lng;
  }

} 

export default storeFormApp;


