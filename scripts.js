const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const captureButton = document.querySelector('.photo-taker');
// filters buttons
let rgbSplitFilter = document.querySelector('.rgb-effect');
let redFilter = document.querySelector('.red-effect');
let greenScreenFilter = document.querySelector('.green-screen-effect');
let cssFiltersButtons = document.querySelectorAll('.css-filters button'); // all css filters buttons

// get video from webcam
function getVideo() {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(MediaStream => {
    video.srcObject = MediaStream;
    video.play();
  })
  .catch(err => {
      console.error('OH Noo! ', err);
  });
}

// draw on canvas
function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);

        if(applyRed) {
          let pixels = ctx.getImageData(0, 0, width, height);
          pixels = redEffect(pixels);
          ctx.putImageData(pixels, 0, 0);
        }

        if(applyRgbSplit) {
          let pixels = ctx.getImageData(0, 0, width, height);
          pixels = rgbSplit(pixels);
          ctx.putImageData(pixels, 0, 0);
        }

        if(applyGreenScreen) {
          let pixels = ctx.getImageData(0, 0, width, height);
          pixels =  greenScreen(pixels);
          ctx.putImageData(pixels, 0, 0);
        }

        if(applyCssFilter) {
          canvas.style.filter = `${cssFilterTarget.dataset.filtername}(${cssFilterTarget.dataset.filtervalue})`;
        } else {
          canvas.style.filter = '';
        }

      }, 16);
}

function takePhoto() {
    // playing snapshot sound
    snap.currentTime = 0;
    snap.play();

    // taking snapshot & put image in strip below video
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    //below two lines of code is outdated, can't access base64 data directly anymore
    // suppose to download image, chk canvas.toBlob() given below
    // link.href = data;
    // link.setAttribute('downlaod', 'handsome');
    link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
    strip.insertAdjacentElement('afterbegin', link);

    // show image in new tab

    // debugBase64(data);

    // function debugBase64(base64URL){
    //     var win = window.open();
    //     var iframe = '<iframe src="' + base64URL  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>';
    //     win.document.write(iframe);
    // }

    // prompt to download image when clicked
    link.addEventListener('click', () => {
      canvas.toBlob(
        blob => {
          const anchor = document.createElement('a');
          anchor.download = 'my-file-name.jpg'; 
          anchor.href = URL.createObjectURL(blob);
      
          anchor.click(); // ✨ magic!
      
          URL.revokeObjectURL(anchor.href); // remove it from memory and save on memory! 😎
        },
        'image/jpeg',
        0.9,
      );
    })

}

// custom filters
function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
}


function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i - 150] = pixels.data[i + 0];
    pixels.data[i + 500] = pixels.data[i + 1];
    pixels.data[i - 550] = pixels.data[i + 2];
  }
  return pixels;
}


function greenScreen(pixels) {
  let levels = {};

  document.querySelectorAll('.rgb input').forEach(input => {
    levels[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i+=4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];
  
    if(red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {

        pixels.data[i + 3] = 0;
      }
    
  }
  return pixels;
}


getVideo();

video.addEventListener('canplay', paintToCanvas);
captureButton.addEventListener('click', takePhoto);

let applyRgbSplit = false;
let applyRed = false;
let applyGreenScreen = false;
let applyCssFilter = false;
let cssFilterTarget;

redFilter.addEventListener('click', () => {
  applyRed = !applyRed;
  applyRgbSplit = false;
  console.log(applyRed)
});

rgbSplitFilter.addEventListener('click', () => {
  applyRgbSplit = !applyRgbSplit;
  applyRed = false;
  console.log(applyRgbSplit)
});

greenScreenFilter.addEventListener('click', () => {
  applyGreenScreen = !applyGreenScreen;
  applyRed = false;
  applyRgbSplit = false;
  console.log(applyGreenScreen)
});

// css filters events
cssFiltersButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    applyCssFilter = !applyCssFilter;
    applyGreenScreen = false;
    applyRed = false;
    applyRgbSplit = false;
    cssFilterTarget = event.target;
    console.log(applyCssFilter)
  })
});

