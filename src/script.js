import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import shadingVertexShader from './Shaders/Light/vertex.glsl'
import shadingFragmentShader from './Shaders/Light/fragment.glsl'
import overlayVertexShader from './Shaders/Overlay/vertex.glsl'
import overlayFragmentShader from './Shaders/Overlay/fragment.glsl'


/**
 * Loaders
 */
// Loading
const loaderElement = document.querySelector('.loading')
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(1, () => {

            loaderElement.style.display = 'none'

            gsap.to(
                overlayMaterial.uniforms.uAlpha, 
                { duration: 1.5, value: 0, delay: 0.5 }
            )

            window.setTimeout(() => {
                initGUI()
            }, 2000)
        })
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => 
    {
        loaderElement.style.display = 'block'
    }
)

const gltfLoader = new GLTFLoader(loadingManager)

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader,
    uniforms: {
        uAlpha: new THREE.Uniform(1)
    },
    transparent: true,
    depthWrite: false,
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 7
camera.position.y = 7
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setClearColor('#0c0c0c')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Material
 */
const materialParameters = {}
materialParameters.color = '#ffffff'
materialParameters.colorLightDirection = '#80ff00'
materialParameters.lightDirectionalOn = false
materialParameters.colorPointLight = '#ff8929'
materialParameters.pointLightOn = true

const material = new THREE.ShaderMaterial({
    vertexShader: shadingVertexShader,
    fragmentShader: shadingFragmentShader,
    uniforms:
    {
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
        uColorLightDirection: new THREE.Uniform(new THREE.Color(materialParameters.colorLightDirection)),
        uLightDirectionOn: new THREE.Uniform(materialParameters.lightDirectionalOn),
        uColorPointLight: new THREE.Uniform(new THREE.Color(materialParameters.colorPointLight)),
        uPointDirectionOn: new THREE.Uniform(materialParameters.pointLightOn)
    }
})

/**
 * Tweaks
 */
function initGUI()
{
    const gui = new GUI()

    gui
    .addColor(materialParameters, 'color')
    .onChange(() =>
    {
        material.uniforms.uColor.value.set(materialParameters.color)
    })

    gui
    .add(materialParameters, 'lightDirectionalOn')
    .name('OnDirectionalLight')
    .onChange(() => {
        material.uniforms.uLightDirectionOn.value = materialParameters.lightDirectionalOn
    })

    gui
    .addColor(materialParameters, 'colorLightDirection')
    .name('directionalLight')
    .onChange(() =>
    {
        material.uniforms.uColorLightDirection.value.set(materialParameters.colorLightDirection)
    })

    gui
    .add(materialParameters, 'pointLightOn')
    .name('OnPointLight')
    .onChange(() => {
        material.uniforms.uPointDirectionOn.value = materialParameters.pointLightOn
    })

    gui
    .addColor(materialParameters, 'colorPointLight')
    .name('pointLight')
    .onChange(() =>
    {
        material.uniforms.uColorPointLight.value.set(materialParameters.colorPointLight)
    })

}

/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Capsula
const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(1, 1, 4, 8 ),
    material
)
capsule.position.x = - 3
scene.add(capsule)

// Suzanne
let suzanne = null
gltfLoader.load(
    './Model/suzanne.glb',
    (gltf) =>
    {
        suzanne = gltf.scene
        suzanne.traverse((child) =>
        {
            if(child.isMesh)
                child.material = material
        })
        scene.add(suzanne)
    }
)

/**
 * Light helpers
 */
// const directionalLightHelper = new THREE.Mesh(
//     new THREE.PlaneGeometry(),
//     new THREE.MeshBasicMaterial()
// )
// directionalLightHelper.material.color.setRGB(0.1, 0.1, 1)
// directionalLightHelper.material.side = THREE.DoubleSide
// directionalLightHelper.position.set(0, 0, 3)
// scene.add(directionalLightHelper)

// const pointLightHelper = new THREE.Mesh(
//     new THREE.IcosahedronGeometry(0.1, 2),
//     new THREE.MeshBasicMaterial()
// )
// pointLightHelper.material.color.setRGB(1, 0.1, 0.1)
// pointLightHelper.material.side = THREE.DoubleSide
// pointLightHelper.position.set(0, 2.5, 0)
// scene.add(pointLightHelper)



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate objects
    if(suzanne)
    {
        suzanne.rotation.x = - elapsedTime * 0.1
        suzanne.rotation.y = elapsedTime * 0.2
    }

    capsule.rotation.x = - elapsedTime * 0.1
    capsule.rotation.y = elapsedTime * 0.2

    torusKnot.rotation.x = - elapsedTime * 0.1
    torusKnot.rotation.y = elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()