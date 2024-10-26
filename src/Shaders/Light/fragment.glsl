uniform vec3 uColor;
uniform vec3 uColorLightDirection;
uniform vec3 uColorPointLight;

uniform bool uLightDirectionOn;
uniform bool uPointDirectionOn;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../Includes/ambientLight.glsl
#include ../Includes/directionalLight.glsl
#include ../Includes/pointLight.glsl

void main()
{
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0);

    if(uLightDirectionOn) {
        light += directionaltLight
            (
                uColorLightDirection,  // Light color
                1.0,                  // Intensity
                normal,               // Normal
                vec3(0.0, 0.0, 3.0),  // Light position
                viewDirection,        // View direction 
                20.0                  // Specular power
            );
    }

    if(uPointDirectionOn) {
        light += pointLight
            (
                uColorPointLight, // Light color
                1.0,                  // Intensity
                normal,               // Normal
                vec3(0.0, 2.5, 0.0),  // Light position
                viewDirection,        // View direction 
                20.0,                 // Specular power
                vPosition,            // Position  
                0.25                  // light decay
            );
    }

    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}