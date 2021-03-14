const registerViewApp = {
  init(){
    this.store = document.querySelector('.store__details');
    if (!this.store || !this.store.dataset)
      return;
    this.storeId = this.store.dataset.id;
    this.registerView();
  },
  
  registerView () {
    const endpoint = `/api/v1/store/${this.storeId}/views`;
    fetch(endpoint, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(console.error);
  }
} 

export default registerViewApp;