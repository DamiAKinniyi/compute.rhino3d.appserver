//Page Setup
//------------------------------------------------------------------------------//
//animate landing page loader
let landing = document.getElementById('landing-page')
//To set time interval for black background
//Could have done this with setTimeout()
setInterval(function(){
    landing.style.opacity= "0"}, 3000)
//To set time interval to remove landing page
setInterval(()=>
    landing.style.display = "none",3300)

//console.log(landing)
//console.log(document.getElementById('myImage').files)
//-------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
//BEGINNING OF SCRIPT//
//----------------------------------------------------------------------------//
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
//import { Line, LineCylinderIntersection, LineSphereIntersection } from 'rhino3dm'

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )
const definition = 'Portraits 3.gh';

// initialise 'data' object that will be used by compute()
/*const data = {
  definition: 'Portraits 3.gh',
  inputs: getInputs()
}*/


const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download

  /////////////////////////////////////////////////////////////////////////////
 //                            HELPER  FUNCTIONS                            //
/////////////////////////////////////////////////////////////////////////////



//Set up Slider Events
//Declare sliders//
//Set up Image Selection and Preview--------------------------------------//
let image, image2, reader, send, imageAddress, filepath;
//let width, height, scale, resolution, colormode, invert, abstraction, dots, boxes, plines, displacement, distortion;

image = document.getElementById("myImage")
const imagePreview = document.getElementsByClassName("image_preview")[0];
image.addEventListener('change', imageChange);
send = document.getElementById('submit');
send.addEventListener("click", onSend);

const width = document.getElementById("width")
width.addEventListener('click',  onSliderChange,false)
width.addEventListener('touchend',  onSliderChange,false)

const height = document.getElementById("height")
height.addEventListener('click', onSliderChange,false)
height.addEventListener('touchend', onSliderChange,false)

const scale = document.getElementById("scale")
scale.addEventListener('click', onSliderChange,false)
scale.addEventListener('touchend', onSliderChange,false)

const resolution = document.getElementById("resolution")
resolution.addEventListener('click', onSliderChange,false)
resolution.addEventListener('touchend', onSliderChange,false)

const colormode = document.getElementById("colormode")
colormode.addEventListener('click', onCheck, false)

const invert = document.getElementById("invert")
invert.addEventListener('click', onCheck, false)
//console.log(invert)

const dots = document.getElementById("dots")
dots.addEventListener("click", onClick)
const boxes = document.getElementById("boxes")
boxes.addEventListener("click", onClick)
const plines = document.getElementById("plines")
plines.addEventListener("click", onClick)
let pixels = 0
//console.log(pixels)

const abstraction = document.getElementById("abstraction")
abstraction.addEventListener('click', onSliderChange,false)
abstraction.addEventListener('touchend', onSliderChange,false)

const displacement = document.getElementById("displacement")
displacement.addEventListener('click', onSliderChange,false)
displacement.addEventListener('touchend', onSliderChange,false)

const distortion = document.getElementById("distortion")
distortion.addEventListener('click', onSliderChange,false)
distortion.addEventListener('touchend', onSliderChange,false)

// globals
let rhino, doc;


rhino3dm().then(async m => {
    rhino = m
    console.log("Loaded rhino3dm.");

    init()
    //compute()
})

/**
 * Gets <input> elements from html and sets handlers
 * (html is generated from the grasshopper definition)
 */
/*function getInputs() {
  const inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
      case 'number':
        inputs[input.id] = input.valueAsNumber
        input.onchange = onSliderChange
        break
      case 'range':
        inputs[input.id] = input.valueAsNumber
        input.onmouseup = onSliderChange
        input.ontouchend = onSliderChange
        break
      case 'checkbox':
        inputs[input.id] = input.checked
        input.onclick = onSliderChange
        break
      default:
        break
    }
  }
    return inputs
}*/

// more globals
let scene, camera, renderer, controls

/**
 * Sets up the scene, camera, renderer, lights and controls and starts the animation
 */

function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1, 1, 1)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(1, -1, 1) // like perspective view

    // very light grey for background, like rhino
    scene.background = new THREE.Color('whitesmoke')

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.intensity = 2
    scene.add( directionalLight )

    const ambientLight = new THREE.AmbientLight()
    scene.add( ambientLight )

    // handle changes in the window size
    window.addEventListener( 'resize', onWindowResize, false )

    animate()
}

/**
 * Call appserver
 */
async function compute() {
  showSpinner(true);
    // initialise 'data' object that will be used by compute()
  const data = {
    definition: definition,
    inputs: {
      'ImageFile.': filepath,
      'Width':width.valueAsNumber,
      'Height':height.valueAsNumber,
      'Scale':scale.valueAsNumber,
      'Resolution':resolution.valueAsNumber,
      'Negative':invert.checked,
      'Monochrome': colormode.checked,
      'Pixels': pixels,
      'Displacement': displacement.valueAsNumber,
      'Abstraction': abstraction.valueAsNumber, 
      'Distortion': distortion.valueAsNumber
    }
  }

  console.log(data.inputs);


  // construct url for GET /solve/definition.gh?name=value(&...)
   //showSpinner(true);
  
    const request = {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
  
    try {
      const response = await fetch("/solve", request);
  
      if (!response.ok) throw new Error(response.statusText);
  
      const responseJson = await response.json();
      collectResults(responseJson);
    } catch (error) {
      console.error(error);
    }

}

/**
 * Parse response
 */
function collectResults(responseJson) {

    const values = responseJson.values

    // clear doc
    if( doc !== undefined)
        doc.delete()

    //console.log(values)
    doc = new rhino.File3dm()

    // for each output (RH_OUT:*)...
    for ( let i = 0; i < values.length; i ++ ) {
      // ...iterate through data tree structure...
      for (const path in values[i].InnerTree) {
        const branch = values[i].InnerTree[path]
        // ...and for each branch...
        for( let j = 0; j < branch.length; j ++) {
          // ...load rhino geometry into doc
          const rhinoObject = decodeItem(branch[j])
          if (rhinoObject !== null) {
            doc.objects().add(rhinoObject, null)
          }
        }
      }
    }

    if (doc.objects().count < 1) {
      console.error('No rhino objects to load!')
      showSpinner(false)
      return
    }

    // load rhino doc into three.js scene
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse( buffer, function ( object ) 
    {
        // debug 
        /*
        object.traverse(child => {
          if (child.material !== undefined)
            child.material = new THREE.MeshNormalMaterial()
        }, false)
        */

        // clear objects from scene. do this here to avoid blink
        scene.traverse(child => {
            if (!child.isLight) {
                scene.remove(child)
            }
        })

        // add object graph from rhino model to three.js scene
        scene.add( object )

        // hide spinner and enable download button
        showSpinner(false)
        downloadButton.disabled = false

        // zoom to extents
        zoomCameraToSelection(camera, controls, scene.children)
    })
}

/**
 * Attempt to decode data tree item to rhino geometry
 */
function decodeItem(item) {
  const data = JSON.parse(item.data)
  if (item.type === 'System.String') {
    // hack for draco meshes
    try {
        return rhino.DracoCompression.decompressBase64String(data)
    } catch {} // ignore errors (maybe the string was just a string...)
  } else if (typeof data === 'object') {
    return rhino.CommonObject.decode(data)
  }
  return null
}


//*/
function onSliderChange () {
  showSpinner(true)

  compute()
}

function onClick(e){
    //show spinner
    showSpinner(true);

    pixels = e.target.getAttribute('alt');   
    compute()
}

function onCheck(e){

  showSpinner(true);
  const x = e.target.getAttribute ('checked');
  if (x===true){
    e.target.setAttribute('checked',"0")
    
  }
  else if (x==false){
    e.target.setAttribute('checked',"1")
  }
  compute()

}

//Start ImageChange and Image Preview//

function imageChange(){
  console.log(image.files)
  console.log(image.files[0])
  console.log(imagePreview)
  while(imagePreview.firstChild){
      console.log(imagePreview.firstChild)
      console.log(imagePreview.innerHTML)
      imagePreview.removeChild(imagePreview.firstChild)
  }
  if (image.files.length === 0){
      alert('No Image Selected')
      imagePreview.innerHTML="No Image Selected"
      return      
  }else{
      alert('you have changed the image')
      updateImageDisplay()
  }  
  send.disabled = false
}

function updateImageDisplay(){
  
  image2 = document.createElement('img');
  imagePreview.appendChild(image2);
  if(validFileType(image.files[0])){
      imageAddress = URL.createObjectURL(image.files[0])}
      image2.src= imageAddress
      //let cleanerpath = imageAddress.substring(10)/*replace('-','+')*/
      //cleanerpath = cleanerpath.replace('_', ('/'))
      console.log(image.files[0])
      image2.alt= image.files[0].name
      console.log(image2)
      //filepath = cleanerpath
}



function validFileType(file) {
  const fileTypes = ["image/png", "image/jpeg"];
  return fileTypes.includes(file.type);
}



function onSend(){
  //show spinner
  showSpinner(true);

  if (image.files && image.files[0]) {
      var fileSize;
      reader = new FileReader();
      //reader.readAsDataURL(image.files[0]);
      
      //console.log(reader.result)
     /* reader.onload = function (event) {
          //var dataUrl = event.target.result; 
          //let imgs = document.createElement("img")
          //imgs.src = dataUrl
          //fileSize = image.files[0].size
          //filepath = reader.result
          let fpath = reader.result;
          console.log(fpath)
         let cleanerPath  = fpath.substring(23)
          //cleanerPath = cleanerPath.replace('-','+')
          //cleanerPath = cleanerPath.replace('_', '/')
         // cleanerPath =  fpath.replace("data:", "");
          //cleanerPath = cleanerPath.replace(/^.+,/, "");
          filepath = cleanerPath
          console.log (filepath)
          compute()
                
      }*/
     reader.onerror = function(event) {
         console.error("File could not be read! Code " + event.target.error.code);
     };

                   
     reader.onloadend = function() {
         alert('Image uploaded')
         filepath=reader.result.replace("data:", "").replace(/^.+,/, "");
         compute()
     }
     
     reader.readAsDataURL(image.files[0]);
     
      
      //console.log(filepath)
      
  }
  //console.log(dataUrl)
  //console.log(reader)
  //console.log(reader.result)
  
  send.disabled = true
  
  return filepath

}


/**
 * The animation loop!
 */
function animate() {
  requestAnimationFrame( animate )
  controls.update()
  renderer.render(scene, camera)
}

/**
 * Helper function for window resizes (resets the camera pov and renderer size)
  */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}

/**
 * This function is called when the download button is clicked
 */
function download () {
    // write rhino doc to "blob"
    const bytes = doc.toByteArray()
    const blob = new Blob([bytes], {type: "application/octect-stream"})

    // use "hidden link" trick to get the browser to download the blob
    const filename = data.definition.replace(/\.gh$/, '') + '.3dm'
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
}

/**
 * Shows or hides the loading spinner
 */
function showSpinner(enable) {
  if (enable)
  document.getElementById('container').style.display = 'flex';
  else
  document.getElementById('container').style.display = 'none';
}
