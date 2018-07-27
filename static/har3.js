var interval_id = 0;

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#play').onclick = () => {

        var ctx = get_ctx();
        var params = readValues();
       // var encoder = setup_encoder();

        //encoder.start();

        var t = 0;

        interval_id =  setInterval(function(){
            console.log(t);

            if(t < params.upper_bound){
                draw(t, ctx, params);
                t = t + params.step_size; 
            }
            else{
                clearInterval(interval_id);
            }   
        }, params.delay)

       
        return false;
    };

});

function get_ctx(){
    var canvas = document.querySelector("#board");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;


    if(interval_id != 0){
        clearInterval(interval_id);
    }
    return ctx;
}

function fix_dpi() {
    //get DPI
    let dpi = window.devicePixelRatio;
    //get canvas
    let canvas = document.getElementById('board');
    //get context
    let ctx = canvas.getContext('2d');
    //get CSS height
    //the + prefix casts it to an integer
    //the slice method gets rid of "px"
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    //get CSS width
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    //scale the canvas
    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}

function readValues(){


    var params = {
        width : document.querySelector("#board").width,
        height : document.querySelector("#board").height,
        ratio : document.querySelector('#ratio').value,
        phase : document.querySelector('#phase').value,
        x_amp : document.querySelector('#x_amp').value,
        y_amp : document.querySelector('#y_amp').value,
        rot_speed : document.querySelector('#rot_speed').value,
        x_rot : document.querySelector('#x_rot').value,
        y_rot : document.querySelector('#y_rot').value,
        decay : document.querySelector('#decay').value,
        delay : document.querySelector('#delay').value,
        step_size : 0.005,
        upper_bound : 100,
        color1 : hex2rgb(document.getElementById('color1').value),
        color2 : hex2rgb(document.getElementById('color2').value),

    };
    
    return params;
};

function updateXY(t, params){
	var x =  params.x_amp * Math.exp(- params.decay * t) * Math.cos(2*Math.PI*t);                 //+ ROT_X * E**(-DECAY * t) * Math.cos(2*Math.PI*rot_speed*t)        
    var y =  params.y_amp * Math.exp(- params.decay * t) * Math.sin(2*Math.PI*t*params.ratio +  params.phase*Math.PI); //+ ROT_Y * E**(-DECAY * t) * Math.sin(2*Math.PI*rot_speed*t)
    var a =  x*Math.cos(2*Math.PI* params.rot_speed*t) - y*Math.sin(2*Math.PI* params.rot_speed*t);
    var b =  x*Math.sin(2*Math.PI* params.rot_speed*t) + y*Math.cos(2*Math.PI* params.rot_speed*t);

    return [a,b];
}


//Download Image listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("download_button").addEventListener("click",() =>{

        var canvas = document.querySelector("#board");
        var img    = canvas.toDataURL("image/png", 1);
        var btn = document.getElementById("download_button");
        btn.disabled = false;
        btn.parentElement.href = img;

    });
});

//Download SVG
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("svg_download_button").addEventListener("click",() =>{

        var params = readValues();
        var ctx = new C2S(params.width,params.height);

        for(var t = 0; t < params.upper_bound; t += params.step_size){
            console.log(t);
            draw(t, ctx, params);
        }
        // console.log(ctx.getSerializedSvg(true).getAttribute('xmlns:xlink'));
        //console.log(ctx.getSerializedSvg(true).getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
        var svgBlob = new Blob([ctx.getSerializedSvg(true)], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        document.getElementById("svg_download_button").parentElement.href = svgUrl;
    });
});




function getColor(t, params){

    let r1 = params.color1[0];
    let g1 = params.color1[1];
    let b1 = params.color1[2];
    let r2 = params.color2[0];
    let g2 = params.color2[1];
    let b2 = params.color2[2];

    var color_change_rate = 20;

    var r = (r1 + ((r2 - r1)/color_change_rate)*t);
    var g = (g1 + ((g2 - g1)/color_change_rate)*t);
    var b = (b1 + ((b2 - b1)/color_change_rate)*t);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function hex2rgb(hex) {
  return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

function skip(){
    
    var params = readValues();
    var ctx = get_ctx();
    for(var t = 0; t < params.upper_bound; t += params.step_size){
        draw(t, ctx, params);
    }
}

//skip listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("skip").addEventListener("click",skip);
});

function draw(t, ctx, params){
        var start = updateXY(t, params);
        ctx.beginPath();      
        ctx.moveTo(start[0] + params.width/2, start[1] + params.height/2);
        ctx.strokeStyle = getColor(t, params);
        var end = updateXY(t + 0.005, params);
        ctx.lineTo(end[0] + params.width/2, end[1] + params.width/2);
        ctx.stroke();
        ctx.closePath();
        
}



function disable_gif_button(){
    var gif_download_button = document.getElementById('gif_download_button');
    gif_download_button.innerHTML = "Rendering GIF";
    gif_download_button.disabled = true;
    // var disp = gif_download_button.style.display;
    // gif_download_button.style.display = 'none';
    // var trick = gif_download_button.offsetHeight;
    // gif_download_button.style.display = disp;
    forceRedraw(gif_download_button);

}

function forceRedraw(element){

    if (!element) { return; }

    var n = document.createTextNode(' ');
    var disp = element.style.display;  // don't worry about previous display style

    element.appendChild(n);
    element.style.display = 'none';

    setTimeout(function(){
        element.style.display = disp;
        n.parentNode.removeChild(n);
    },100); // you can play with this timeout to make it as short as possible
}

function download_gif(){

    var params = readValues();

    var canvas = document.getElementById('hidden_board');
    canvas.width = params.width;
    canvas.height = params.height;
    var ctx = canvas.getContext("2d");

    const gif_res = 10;// record gif after these many frames
    let gif_count = 0;

    const FPS = 10;//1000/params.delay; // Frames per second.
    const LOOPS = 0; // 0 = loop forever.

    let encoder = new GIFEncoder();
    encoder.setRepeat(LOOPS);
    encoder.setDelay(1000/FPS);
    encoder.start();

    for(var t = 0; t < 10; t += params.step_size){
        console.log(t);
        gif_count++;
        draw(t, ctx, params);
        if(gif_count == gif_res){
            encoder.addFrame(ctx);
            gif_count = 0;
        }
    }
    encoder.finish();
    encoder.download("harmonograph.gif");

    var gif_download_button = document.getElementById('gif_download_button');
    gif_download_button.innerHTML = 'Download GIF';
    gif_download_button.disabled = false;

}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("gif_download_button").addEventListener("click", function(){
        disable_gif_button();
        setTimeout(download_gif(), 1000);

    });
});


