const deleteReviewApp = {
  init(){
    this.deleteIcons = document.querySelectorAll('.icon--delete');
    this.setUpEventListeners();
  },
  
  setUpEventListeners() {
    this.deleteIcons.forEach(icon => icon.onclick = this.deleteReview);
  },
    
  deleteReview () {
    const endpoint = `/api/v1/review/${this.dataset.id}/delete`;
      fetch(endpoint, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(data => {
        this.closest('.review').remove();
      })
      .catch(console.error)
  }
} 

export default deleteReviewApp;