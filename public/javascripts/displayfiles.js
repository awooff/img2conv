function loadFile(event) {
  let image = document.getElementById('output');
  image.src = URL.createObjectURL(event.target);
}

