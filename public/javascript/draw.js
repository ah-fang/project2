// const fs = require('fs');
// const { UUID } = require('sequelize');

// loads the canvas upon loading the page
window.onload = () => {
  // document.querySelector("#clear").addEventListener("click", clearBtnHandler);
  // document.querySelector("#post").addEventListener("click", postBtnHandler);

  const canvas = document.getElementById('canvas');
  const clearButton = document.getElementById('clear');
  const saveButton = document.getElementById('save');
  const loadInput = document.getElementById('load');

  new Drawing(canvas, clearButton, saveButton, loadInput);  
};


// creates the drawing events
class Drawing {
  constructor(canvas, clearButton, saveButton, loadInput) {
    this.isDrawing = false;

    // mouse down is when you click and mouseup is when you release
    canvas.addEventListener("mousedown", () => this.startDrawing());
    canvas.addEventListener("mousemove", (event) => this.draw(event));
    canvas.addEventListener("mouseup", () => this.stopDrawing());

    clearButton.addEventListener("click", () => this.clear());
    saveButton.addEventListener("click", () => this.save());
    // postButton.addEventListener("click", () => this.post());
    loadInput.addEventListener("change", (event) => this.load(event));
    // rect aligns the cursor with the canvas
    const rect = canvas.getBoundingClientRect();

    this.offsetLeft = rect.left;
    this.offsetTop = rect.top;

    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
  }
  startDrawing() {
    this.isDrawing = true;
  }
  stopDrawing() {
    this.isDrawing = false;
    // adding beginPath here allows you to disconnect the line when you release and start drawing in a new space 
    this.context.beginPath();
  }
  draw(event) {
    if (this.isDrawing) {
      this.context.strokeStyle = "#000";
      this.context.lineJoin = "round";
      this.context.lineWidth = 1;
      this.context.lineTo(
        event.pageX - this.offsetLeft,
        event.pageY - this.offsetTop
      );
      this.context.closePath();
      this.context.stroke();
      this.context.moveTo(
        event.pageX - this.offsetLeft,
        event.pageY - this.offsetTop
      );
    }
  }

  clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  // saves your image to your computer 
  save() {
    
    const data = this.canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = data;
    a.download = "image.png";
    a.click();
  }

  load(event) {
    const file = [...event.target.files].pop();
    this.readTheFile(file).then((image) => this.loadTheImage(image));
  }
  // places a chosen file to draw over
  loadTheImage(image) {
    const img = new Image();
    const canvas = this.canvas;
    img.onload = function () {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = image;
  }
  readTheFile(file) {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

}

const clearBtnHandler = (event) => {
  event.preventDefault();  
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

const postBtnHandler = async(event) => {
  //save the drawing to a url and send all its relevant info to db in post request
  event.preventDefault();

  // const imgURL = makeId();
  // fs.writeFile(`./images/${imgURL}`, data, err => {
  //     if(err) {
  //         console.log(err);
  //         return;
  //     }

  //     console.log("File created successfully");
  // });
  const canvas = document.getElementById('canvas');
  const draw_url = canvas.toDataURL("image/png");
  const title = document.querySelector('input[name="post-title"]').value;
  const post_text = document.querySelector('input[name="post-text"]').value;

  const response = await fetch(`/api/posts`, {
      method: 'POST',
      body: JSON.stringify({
          title, draw_url, post_text
      }),
      headers: {
          'Content-Type': 'application/json'
      }
  });

  if(response.ok) {
      console.log('successfully posted');
      document.location.replace('/dashboard');
  } else {
      alert(response.statusText);
  }
}

const deleteBtnHandler = async(event) => {
  event.preventDefault();

  const id = window.location.toString().split('/')[
      window.location.toString().split('/').length - 1
  ];
  const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE'
  });

  if(response.ok) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height)
    document.location.replace('/dashboard');
  } else {
      alert(response.statusText);
  }
}

document.getElementById('post').addEventListener('click', postBtnHandler);