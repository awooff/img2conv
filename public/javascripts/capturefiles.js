const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  const images = document.getElementById('filetype_select');

  const formData = new FormData(form);

  for (let i = 0; i < files.files.length; ++i) {
    formData.append('files', files.files);
  }

  const url = '/processor';
  const fetchOptions = {
    method: 'post',
    body: formData
  };

  fetch(url, fetchOptions)
    .then(response => console.log(response))
    .catch(err => console.error(err.stack));
}

