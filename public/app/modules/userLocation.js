import { $, $$ } from './bling';

const userLocationApp =  {
  init () {
    this.coordinates = {};
    this.query = '';
    this.url = '#';
    this.locationInput = document.querySelector('#location-input');
    this.locationSubmit = document.querySelector('#location-submit');
    this.window = window;
    if(!this.locationInput || !this.locationSubmit)
      return;    
      
    this.setUpEventListeners();
  },

  setUpEventListeners () {
    const fetchResults = this.fetchResults.bind(this);
    const getGeolocation = this.getGeolocation.bind(this);     
    this.locationSubmit.addEventListener('click', fetchResults);
    this.locationInput.addEventListener('keydown', fetchResults);
    this.window.addEventListener('load', getGeolocation);
  },
  
  fillAddress(address) {
    this.locationInput.value = address;
  },
  
  setQuery () {
    this.query = this.locationInput.value.trim();
  },
  
  setCoords() {
    //query here being the address
    if (!this.query) {
      this.url = '#';
      this.locationSubmit.href = this.url;
      return false;
    }
    const endpoint = `https://geocode.search.hereapi.com/v1/geocode?q=${this.query}&apiKey=_xnhwmiBDL1j8TXuF5iJ0UNj91j4OzqrLKXtswUDeI8`
    
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        this.coordinates = data.items[0].position;
        this.url = `/results/stores/near?lat=${this.coordinates.lat}&lng=${this.coordinates.lng}`;  this.locationSubmit.href = this.url;
        window.location.href = this.locationSubmit.href;
      })
      .catch(console.error);
  },
  
  fetchResults (e) {
    if(e.target === this.locationInput && e.keyCode !== 13)
      return;
    if(e.target === this.locationSubmit)
      e.preventDefault();
    this.setQuery();
    this.setCoords();
  },
      
  getGeolocation() {
    const fillAddress = this.fillAddress.bind(this);
    const setCoords = this.setCoords.bind(this);
    const platform = new H.service.Platform({
      "apikey": "_xnhwmiBDL1j8TXuF5iJ0UNj91j4OzqrLKXtswUDeI8"
    });
    const geocoder = platform.getSearchService();
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        geocoder.reverseGeocode(
          {
            limit: 1,
            at: position.coords.latitude + "," + position.coords.longitude
          }, 
          data => {
            fillAddress(data.items[0].address.label);
            setCoords();
            }, 
          error => {
            console.error(error);
          }
        );
      });
    } else {
        console.error("Geolocation is not supported by this browser!");
    }
  }
} 
export default userLocationApp;