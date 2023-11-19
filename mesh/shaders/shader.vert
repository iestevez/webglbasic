#version 300 es
precision highp float;
in vec3 aPosition;


uniform mat4 modelview;
uniform mat4 projection;




void main(){
    vec4 position = projection*modelview*vec4(aPosition,1.0f);
    

    gl_Position=position;
}

