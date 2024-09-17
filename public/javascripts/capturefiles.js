const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  const images = document.getElementById("images");
  const selection = document.getElementById("filetype_select");
  const extension = selection.options[selection.selectedIndex].text;

  const body = new FormData(form);

  for (let i = 0; i < images.files.length; ++i) {
    body.append("images", images.files);
  }

  body.append("extension", extension);

  const url = "/processor";
  const fetchOptions = {
    method: "post",
    body,
  };

  fetch(url, fetchOptions)
    .then((response) => console.log(response))
    .catch((err) => console.error(err.stack));
}
