import { $, $$ } from './bling';

const formsApp =  {
  init () {
    this.buttons = $$('.toggle-form');
    this.forms = $$('.container--form');
    if(!this.buttons || !this.forms)
      return;
    this.setupEventListeners();
  },

  setupEventListeners () {
    const toggleForm = this.toggleForm.bind(this);
    this.buttons.forEach(button => button.addEventListener('click', toggleForm));
  },

  toggleForm () {
    this.forms.forEach(form => form.classList.contains('hide') ? form.classList.remove('hide') : form.classList.add('hide'));
  }

} 

export default formsApp;


