# webglbasic

WebGL2 project examples to demonstrate the capabilities of the API.

## Examples:

### 1. Mesh. 

Rendering of a mesh with several material slots. Mesh is defined with a json file. In the model folder is the Blender project used to obtain a valid json file. The project includes a blender script using the Python API of Blender to generate de json file. In order to work, the Blender object has to provide at least one  material slot, with a Not-Nodes Material definition. At the pressent moment, only the diffuse_color property is exported. A correct exports requires of mesh triangularization and selection of the object prior to running the script.

![Mesh example rendered image](https://github.com/iestevez/webglbasic/blob/main/docs/images/mesh.JPG)


