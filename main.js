
//source https://ourcodeworld.com/articles/read/491/how-to-retrieve-images-from-the-clipboard-with-javascript-in-the-browser
function retrieveImageFromClipboardAsBlob(pasteEvent, callback){
	if(pasteEvent.clipboardData == false){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };

    var items = pasteEvent.clipboardData.items;

    if(items == undefined){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };

    for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        var blob = items[i].getAsFile();

        if(typeof(callback) == "function"){
            callback(blob);
        }
    }
}


window.addEventListener("paste", function(e){

    // Handle the event
    retrieveImageFromClipboardAsBlob(e, function(imageBlob){
        // If there's an image, display it in the canvas
        if(imageBlob){
            var canvas = document.getElementById("screenshotCanvas");
            var ctx = canvas.getContext('2d');
            
            // Create an image to render the blob on the canvas
            var img = new Image();

            // Once the image loads, render the img on the canvas
            img.onload = function(){
                document.getElementById('instructions').innerText = "";
                document.getElementById('imageContainer').style.overflow = 'scroll';
                // Update dimensions of the canvas with the dimensions of the image
                canvas.width = this.width;
                canvas.height = this.height;

                // Draw the image
                ctx.drawImage(img, 0, 0);

                //get color of pixel
                var rgbaValue = document.getElementById('rgbaValue');
                var colorPreview = document.getElementById('colorPreview');
                function pick(event) {
                  var x = event.layerX;
                  var y = event.layerY;
                  var pixel = ctx.getImageData(x, y, 1, 1);
                  var data = pixel.data;
                  var rgba = 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
                  
                  //HEX Value
                  //Color codes Conversion
                  r = data[0].toString(16);
                  g = data[1].toString(16);
                  b = data[2].toString(16);
                  a = (data[3] / 255).toString(16);
              
                  if (r.length == 1)
                    r = "0" + r;
                  if (g.length == 1)
                    g = "0" + g;
                  if (b.length == 1)
                    b = "0" + b;
                  if (a.length == 1)
                    a = "0" + a;
              
                  //document.getElementById('hexValue').textContent =  "#" + r + g + b + a;

                  //RGBA Value
                  //rgbaValue.textContent = 'RGBA: (' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
                  
                  //document.getElementById('body').style.backgroundColor = rgba;

                  canvas.addEventListener('click', function(){
                    colorPreview.style.backgroundColor = rgba;
                      document.getElementById('hexValue').textContent =  "#" + r + g + b + a;
                      rgbaValue.textContent = '(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
                      var hslaValue = kwulers.getHSLFromRGB([data[0], data[1], data[2]]);
                      document.getElementById('hslaValue').textContent = '(' + hslaValue[0] + ', ' + hslaValue[1] + '%' + ', ' + hslaValue[2] + '%' + ', ' + (data[3] / 255) + ')';
                    })
                }

                //zoom into image
                var zoom = function(event) {
                  var zoomctx = document.getElementById('zoomCanvas').getContext('2d');
                  var x = event.layerX;
                  var y = event.layerY;
                  zoomctx.imageSmoothingEnabled = this.checked;
                  zoomctx.mozImageSmoothingEnabled = this.checked;
                  zoomctx.webkitImageSmoothingEnabled = this.checked;
                  zoomctx.msImageSmoothingEnabled = this.checked;
                  zoomctx.drawImage(canvas,
                    Math.min(Math.max(0, x - 5), img.width - 10),
                    Math.min(Math.max(0, y - 5), img.height - 10),
                    10, 10,
                    0, 0,
                    150, 150);
                }
                canvas.addEventListener('mousemove', zoom);
                canvas.addEventListener('mousemove', pick);
            };




            // Crossbrowser support for URL
            var URLObj = window.URL || window.webkitURL;

            // Creates a DOMString containing a URL representing the object given in the parameter
            // namely the original Blob
            img.src = URLObj.createObjectURL(imageBlob);
        }
    });
}, false);



//center crosshair on zoom canvas
var zoomCrosshair = document.getElementById('zoomCrosshair');
var context = zoomCrosshair.getContext('2d');

//center
var x = zoomCrosshair.width / 2;
var y = zoomCrosshair.height / 2;

var xs = zoomCrosshair.width / 1.65;
var ys = zoomCrosshair.height / 1.65;

//remove aliasing
x = Math.floor(x) + 0.5;
y = Math.floor(y) + 0.5;
context.strokeWidth = 1;

context.moveTo(x, y - 150);
context.lineTo(x, y + 150);

context.moveTo(x - 150, y);
context.lineTo(x + 150, y);

xs = Math.floor(xs) + 0.5;
ys = Math.floor(ys) + 0.5;
context.strokeWidth = 1;

context.moveTo(xs, ys - 150);
context.lineTo(xs, ys + 150);

context.moveTo(xs - 150, ys);
context.lineTo(xs + 150, ys);


//Line color
context.strokeStyle = 'green';
context.stroke();

//Copy Buttons
new ClipboardJS('#hexCopyBtn', {
  text: function() {
      console.log(document.getElementById('hexValue').innerText);
      return document.getElementById('hexValue').innerText;
  }
});

new ClipboardJS('#rgbaCopyBtn', {
  text: function() {
      console.log('rgba' + document.getElementById('rgbaValue').innerText);
      return 'rgba' + document.getElementById('rgbaValue').innerText;
  }
});

new ClipboardJS('#hslaCopyBtn', {
  text: function() {
      console.log('hsla' + document.getElementById('hslaValue').innerText);
      return 'hsla' + document.getElementById('hslaValue').innerText;
  }
});

//Coyp Buttons
var hexCopyBtn = document.getElementById('hexCopyBtn');
var rgbaCopyBtn = document.getElementById('rgbaCopyBtn');
var hslaCopyBtn = document.getElementById('hslaCopyBtn');
var copyNotification = document.getElementById('copyNotification');


hexCopyBtn.addEventListener('click', function(){
  if(document.getElementById('hexValue').innerText != ''){
    copyNotification.style.display = 'block';
    copyNotification.style.opacity = '1';
    setTimeout(function () {
      copyNotification.style.display = 'none';
    }, 2000);
  }
})
rgbaCopyBtn.addEventListener('click', function(){
  if(document.getElementById('rgbaValue').innerText != ''){
    copyNotification.style.display = 'block';
    setTimeout(function () {
      copyNotification.style.display = 'none';
    }, 2000);
  }
})
hslaCopyBtn.addEventListener('click', function(){
  if(document.getElementById('hslaValue').innerText != ''){
    copyNotification.style.display = 'block';
    setTimeout(function () {
      copyNotification.style.display = 'none';
    }, 2000);
  }
})


