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
//Import Libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { RhinoCompute } from 'https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'
//---------------------------------------------------------------------------------//

//Set up Slider Events
//Declare sliders//
//Set up Image Selection and Preview--------------------------------------//
let image, image2, reader, imageAddress, filepath;
image = document.getElementById("myImage")
const imagePreview = document.getElementsByClassName("image_preview")[0];
image.addEventListener('change', imageChange);



//-----------------------------------------------------------//

//Setup Parameter Sliders-----------------------------------------//
let width, height, clarity, abstraction, yay, nay, invert, dots, boxes, pixels, monochrome, coloured, colorMode, holder;


width = document.getElementById("width")
width.addEventListener('click',  onSliderChange,false)
width.addEventListener('touchend',  onSliderChange,false)

height = document.getElementById("height")
height.addEventListener('click', onSliderChange,false)
height.addEventListener('touchend', onSliderChange,false)

clarity = document.getElementById("clarity")
clarity.addEventListener('click', onSliderChange,false)
clarity.addEventListener('touchend', onSliderChange,false)

abstraction = document.getElementById("abstraction")
abstraction.addEventListener('click', onSliderChange,false)
abstraction.addEventListener('touchend', onSliderChange,false)

yay = document.getElementById("true")
yay.addEventListener("click", onClick, false)
nay = document.getElementById("false")
nay.addEventListener("click", onClick)
invert = 0

dots = document.getElementById("dots")
dots.addEventListener("click", onClick)
boxes = document.getElementById("boxes")
boxes.addEventListener("click", onClick)
pixels = 0

monochrome = document.getElementById("monochrome")
monochrome.addEventListener("click", onClick)
coloured = document.getElementById("coloured")
coloured.addEventListener("click", onClick)
colorMode = 0

filepath = imageAddress //"./Images/Starting Image-01.jpg/"
//console.log(filepath)
console.log(filepath)




const definitionName = 'Portraits 2.gh';
const loader = new Rhino3dmLoader()
loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/')

let rhino, definition, doc
rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.')
    rhino = m // global


    //RhinoCompute.url = getAuth( 'RHINO_COMPUTE_URL' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
    //RhinoCompute.apiKey = getAuth( 'RHINO_COMPUTE_KEY' )  // RhinoCompute server api key. Leave blank if debugging locally.
    
    RhinoCompute.url = 'http://localhost:8081/' //if debugging locally.


    // load a grasshopper file!
    const url = definitionName
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const arr = new Uint8Array(buffer)
    definition = arr

    init()
    compute()
})

async function compute() {

    // clear objects from scene
     scene.traverse(child => {
        if (child.type === "Object3D") {
            scene.remove(child)
        }
    })


    const param1 = new RhinoCompute.Grasshopper.DataTree('Image Width')
    param1.append([0], [width.valueAsNumber])
   // console.log(param1)

    const param2 = new RhinoCompute.Grasshopper.DataTree('Image Height')
    param2.append([0], [height.valueAsNumber])
    //console.log(param2)

    const param3 = new RhinoCompute.Grasshopper.DataTree('Image Clarity')
    param3.append([0], [clarity.valueAsNumber])
    //console.log(param3)

    const param4 = new RhinoCompute.Grasshopper.DataTree('Abstraction')
    param4.append([0], [abstraction.valueAsNumber])
    //console.log(param4)

    const param5 = new RhinoCompute.Grasshopper.DataTree('Invert Image')
    param5.append([0],[invert])
    //console.log(param5)

    const param6 = new RhinoCompute.Grasshopper.DataTree('Pixels')
    param6.append([0],[pixels])
    //console.log(param6)

    const param7 = new RhinoCompute.Grasshopper.DataTree('Color Mode')
    param7.append([0],[colorMode])
    console.log(param7)

    const param8 = new RhinoCompute.Grasshopper.DataTree('Image File')
    console.log(filepath)
    param8.append([0],[filepath])
    console.log(param8)

    //console.log(invert)
    //console.log(pixels)
    //console.log(colorMode)

    // clear values
    const trees = []
    trees.push(param1)
    trees.push(param2)
    trees.push(param3)
    trees.push(param4)
    trees.push(param5)
    trees.push(param6)
    trees.push(param7)
    trees.push(param8)



    const res = await RhinoCompute.Grasshopper.evaluateDefinition(definition, trees)
    console.log(res)
        


    doc = new rhino.File3dm()

    // hide spinner
    document.getElementById('container').style.display = 'none'

    for (let i = 0; i < res.values.length; i++) {

        for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
            for (const d of value) {

                const data = JSON.parse(d.data)
                //console.log(data)
                const rhinoObject = rhino.CommonObject.decode(data)
                doc.objects().add(rhinoObject, null)

            }
        }
    }
  // go through the objects in the Rhino document

  let objects = doc.objects();
  //console.log(objects)
  for ( let i = 0; i < objects.count; i++ ) {
  
    const rhinoObject = objects.get( i );
    //console.log(rhinoObject)


     // asign geometry userstrings to object attributes
    if ( rhinoObject.geometry().userStringCount > 0 ) {
      const g_userStrings = rhinoObject.geometry().getUserStrings()
      rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
      
    }
  }





    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse(buffer, function (object) {
        //object.rotation.z = Math.PI (Work on image rotation to keep portrait or landscape)

        object.traverse((child) => {
            if (child.isLine) {
      
              if (child.userData.attributes.geometry.userStringCount > 0) {
                
                //get color from userStrings
                const colorData = child.userData.attributes.userStrings[0]
                const col = colorData[1];
      
                //convert color from userstring to THREE color and assign it
                const threeColor = new THREE.Color("rgb(" + col + ")");
                const mat = new THREE.LineBasicMaterial({ color: threeColor });
                child.material = mat;
              }
            }
          });

        scene.add(object)
        //console.log(scene)
        // hide spinner
        document.getElementById('container').style.display = 'none'

    })
}
// EVENT DEFINITIONS----------------------------------//

function onSliderChange() {
    // show spinner
    document.getElementById('container').style.display = 'flex'
    compute()
}
function onClick(e){
    //show spinner
    document.getElementById('container').style.display = 'flex';

    holder = e.target.getAttribute('alt');
    console.log(holder)
    if(e.target.id=== "true" || e.target.id=== "false" ){
        invert = holder
    }else if(e.target.id=== "dots" || e.target.id=== "boxes"){
        pixels = holder
    }else{
        colorMode = holder
    }    
    compute()
}


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
    //compute()
     
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
const fileTypes = ["image/png", "image/jpeg"];

function validFileType(file) {
    return fileTypes.includes(file.type);
  }

let send = document.getElementById('submit');
send.addEventListener("click", onSend);


///*
function onSend(){
    //show spinner
    document.getElementById('container').style.display = 'flex';

    if (image.files && image.files[0]) {
        var fileSize;
        reader = new FileReader();
        reader.readAsDataURL(image.files[0]);
        
        //console.log(reader.result)
        reader.onload = function (event) {
            //var dataUrl = event.target.result; 
            //let imgs = document.createElement("img")
            //imgs.src = dataUrl
            //fileSize = image.files[0].size
            //filepath = reader.result
            let fpath = reader.result;
            console.log(fpath)
            var cleanerPath = fpath.substring(23)
            //cleanerPath = cleanerPath.replace('-','+')
            //cleanerPath = cleanerPath.replace('_', '/')
            filepath = cleanerPath
            console.log (filepath)
            compute()
            

            
        };
       reader.onerror = function(event) {
           console.error("File could not be read! Code " + event.target.error.code);
       };

                     
       reader.onloadend = function() {
           alert('Done')
       }
        
        //console.log(filepath)
        
    }
    //console.log(dataUrl)
    //console.log(reader)
    //console.log(reader.result)
    
    send.disabled = true
    

}
//*/



// BOILERPLATE //
let scene, camera, renderer, controls

function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );
    


    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1, 1, 1)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z=60


    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    const Axis = new THREE.AxesHelper(5)
    scene.add(Axis)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.intensity = 2
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)

    //console.log(scene)

    animate()
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}
