#version 300 es  

precision highp float;


out vec4 OutFragColor;
uniform vec3 DiffuseColor;
void main()
{
    OutFragColor=vec4(DiffuseColor,1.0f);
}

