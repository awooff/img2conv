const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();

  uploadFiles();
}

function uploadFiles() {
  const url = '/processor';
  const formData = new FormData(form);
  const fetchOptions = {
    method: 'post',
    body: formData
  }

  fetch(url, fetchOptions);
}
