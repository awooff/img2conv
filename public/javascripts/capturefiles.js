const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  const images = document.getElementById("images");
  const selection = document.getElementById("filetype_select");
  const extension = selection.options[selection.selectedIndex].text;

  const body = new FormData(form);

  for (let i = 0; i < images.files.length; ++i) {
    body.append("images", images.files[i]);
  }

  body.append("extension", extension);

  const url = "/processor";
  const fetchOptions = {
    method: "post",
    body,
  };

  fetch(url, fetchOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/zip")) {
        return response.blob();
      } else {
        return response.json();
      }
    })
    .then((data) => {
      if (data instanceof Blob) {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "converted_files.zip";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Error:", data.message);
      }
    })
    .then(() => fetch("/cleanup", { method: "get" }))
    .catch((error) => console.error("Error:", error));
}
