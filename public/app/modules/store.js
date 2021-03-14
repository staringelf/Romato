import { $, $$ } from './bling';

const storeApp =  {
  init () {
    this.reviewButton = $('.store__action--feedback');
    this.feedbackForm = $('.feedback');
    this.closeButton = $('.close-feedback');
    if (!this.reviewButton || !this.feedbackForm)
      return;
    this.setupEventListeners();
  },

  setupEventListeners () {
    const showForm = this.showForm.bind(this);
    const hideForm = this.hideForm.bind(this);
    this.reviewButton.on('click', showForm);
    this.closeButton.on('click', hideForm);
  },

  showForm () {
    this.feedbackForm.classList.remove('hide');
    document.body.classList.add('unscroll');
  },
  
  hideForm () {
    this.feedbackForm.classList.add('hide');
    document.body.classList.remove('unscroll');
  }

} 

export default storeApp;