
import { $, $$ } from './bling';

const bookmarkApp =  {
  init () {
    this.bookmarkForms = $$('.bookmark');
    if(!this.bookmarkForms)
      return;
    this.setupEventListeners();
  },

  setupEventListeners () {
    this.bookmarkForms.forEach(form => form.on('submit', this.toggleBookmark));
  },

  toggleBookmark (e) {
    e.preventDefault();
    const endpoint = this.action;
    fetch(endpoint, {
      method: 'POST',
    })
    .then(res => {
      // console.log(res.json()); //the user
      const icon = this.querySelector('.icon');
      icon.classList.toggle('icon--red');
    })
    .catch(console.error);
    //also works without just 'icon' ?-?
    
  }
  
} 

export default bookmarkApp;