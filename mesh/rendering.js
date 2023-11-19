const sizeFloat = 4;
const sizeUnsignedShort = 2;

var context, shader;
var positionAttribLocation, colorAttribLocation;
var projectionUniformLocation, modelViewUniformLocation;

// Single vertex data
var vdata;

// Vertex array object
var vao;


var vertices = [
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0
];

var colors = [
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0
];

var retrievedIndices = [
    [
        1, 2, 0,
        3, 6, 2,
        7, 4, 6,
        5, 0, 4,
        6, 0, 2,
        3, 5, 7,
        1, 3, 2,
        3, 7, 6,
        7, 5, 4,
        5, 1, 0,
        6, 4, 0,
        3, 1, 5
    ]
];

var indices = [

    1, 2, 0,
    3, 6, 2,
    7, 4, 6,
    5, 0, 4,
    6, 0, 2,
    3, 5, 7,
    1, 3, 2,
    3, 7, 6,
    7, 5, 4,
    5, 1, 0,
    6, 4, 0,
    3, 1, 5

];

var materials = [{
    name: "default",
    diffuse_color: [1.0, 1.0, 1.0, 1.0]
}];

var slots = [0];

// 2 GetShader

const getShader = async function (ctxt, sname, shaderType) {

    async function compiling(ctxt, scriptText) {
        const script_text = scriptText.trim();
        let shader = null;
        if (shaderType == 'x-shader/x-vertex') {
            shader = ctxt.createShader(ctxt.VERTEX_SHADER);
        }
        else if (shaderType == 'x-shader/x-fragment') {
            shader = ctxt.createShader(ctxt.FRAGMENT_SHADER);
        }
        ctxt.shaderSource(shader, scriptText);
        ctxt.compileShader(shader);
        if (!ctxt.getShaderParameter(shader,
            ctxt.COMPILE_STATUS)) {
            comperror = context.getShaderInfoLog(shader);
            let error = new Error(
                "Resultado de la compilación erróneo: "
                + comperror);

            throw error;
        }
        else if (!shader) {
            let error = new Error(" No se pudo crear un shader para ser compilado");
            throw error;
        }
        else {
            return shader;
        }

    }

    try {

        const response = await window.fetch(`http://localhost:5500/${sname}`);
        const scriptText = await response.text();
        const compShader = await compiling(ctxt, scriptText);
        return compShader;

    }
    catch (error) {
        let response = new Error("En getShader:" + error);
        throw response;
    }
}

// 3 Init

async function init() {

    async function programToContext(vs, ps) {
        // Creación de un programa shader
        // Inclusión de los programas compilados
        // linkado y carga
        shader = context.createProgram();
        context.attachShader(shader, vs);
        context.attachShader(shader, ps);
        context.linkProgram(shader);
        if (!context.getProgramParameter(shader,
            context.LINK_STATUS)) {
            let error = new Error(
                "Error en la fase de linking");
            throw error;

        }

        context.useProgram(shader);


        projectionUniformLocation =
            context.getUniformLocation(shader,
                'projection');
        modelViewUniformLocation =
            context.getUniformLocation(shader,
                'modelview');
        diffuseColorUniformLocation =
            context.getUniformLocation(shader,
                'DiffuseColor');

        return context.getProgramParameter(shader,
            context.LINK_STATUS);
    }

    const canvas =
        document.getElementById('webgl-canvas');

    if (!canvas) {
        let error = new Error(
            'Sorry! No canvas element');
        throw error;
    }

    context = canvas.getContext("webgl2");
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    if (!context) {
        let error = new Error(
            "No se creo el contexto");
        throw error;
    }

    // Load Model


    await fetch('./models/mesh.json')
        .then((response) => response.json())
        .then((json) => { vertices = json.vertexdata; retrievedIndices = json.indexdata; materials = json.materials; });

    if (materials.length > 1)
        materials.shift(); // Discard default


    // Shaders
    const vs = await getShader(
        context, "shaders/shader.vert",
        'x-shader/x-vertex');
    const ps = await getShader(
        context, "shaders/shader.frag",
        'x-shader/x-fragment');
    return await programToContext(vs, ps);

}

async function initbuffer() {

    try {
        // Prepare indices
        indices = [];

        slots = [];
        start = 0;
        retrievedIndices.forEach(function (slot) {
            slots.push(start);
            indices = indices.concat(slot);
            start += slot.length;
        });



        console.log(`Slots: ${slots[0]} ${slots[1]} ${slots[2]} ${slots[3]}`);
        console.log(`Indices: ${indices}`);

        // Single buffer

        let nvertices = vertices.length / 3;
        vdata = new Array(nvertices * 3);

        vdata = vertices;


        // Uniform: buffer de vértices: posiciones
        // VAO Buffer
        vao = context.createVertexArray(); // This disable attriibutes
        context.bindVertexArray(vao);

        vertexBuffer = context.createBuffer();
        context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer); // This is not changing the VAO state
        context.bufferData(context.ARRAY_BUFFER,
            new Float32Array(vdata), context.STATIC_DRAW);

        context.useProgram(shader);
        positionAttribLocation = context.getAttribLocation(shader, 'aPosition');


        context.enableVertexAttribArray(positionAttribLocation); // This changes VAO state
        context.vertexAttribPointer(positionAttribLocation, 3, context.FLOAT, false, 3 * sizeFloat, 0); // This changes VAO state

        // Index Buffer Object
        indexBuffer = context.createBuffer();
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer); // This is stored in the VAO!
        context.bufferData(context.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), context.STATIC_DRAW);


        return true;
    }
    catch (error) {
        throw error;
    }
}

// 6. Inicializaci'on del estado del mundo

var mMat, vMat, pMat, mvMat;
var lastupdate = 0;

function initworld() {
    pMat = mat4.create();
    vMat = mat4.create();
    mMat = mat4.create();
    mvMat = mat4.create();
    mat4.translate(mMat,
        mMat,
        [0.0, 0.0, -5.0]);
    var eye, pos, up;
    eye = vec3.create();
    eye.set(0.0, 0.0, 0.0);
    pos = vec3.create();
    pos.set(0.0, 0.0, -10.0);
    up = vec3.create();
    up.set(0.0, 1.0, 0.0);
    mat4.lookAt(vMat, eye, pos, up);
    mat4.multiply(mvMat, mMat, vMat);




}

// 7. Bucle del juego
var lastupdate = 0
function gameloop(timestamp) {
    step = timestamp - lastupdate;
    lastupdate = timestamp;

    update(step);

    draw();

    window.requestAnimationFrame(gameloop);

}

// 8. update

function update(step) {
    const vel = 50 / 1000;
    let delta = (step * vel) % 360;

    // Preparamos transformaciones
    const FOV = 45 * Math.PI / 180;
    const r = context.canvas.clientWidth / context.canvas.clientHeight;
    const near = 0.1;
    const far = null;
    mat4.perspective(pMat, FOV, r, near, far);
    const axis = vec3.fromValues(1.0, 1.0, 1.0);
    mat4.rotate(mMat, mMat, delta * Math.PI / 180, axis);
    mat4.multiply(mvMat, mMat, vMat);
}



function draw() {

    context.clearColor(0.0, 0.0, 1.0, 1.0);
    context.clearDepth(1.0);
    context.depthFunc(context.LEQUAL);
    context.enable(context.DEPTH_TEST);
    context.enable(context.CULL_FACE);
    context.clear(context.COLOR_BUFFER_BIT |
        context.DEPTH_BUFFER_BIT);

    context.viewport(0, 0, context.canvas.width,
        context.canvas.height);

    context.useProgram(shader);
    context.uniformMatrix4fv(projectionUniformLocation, false, pMat);

    context.bindVertexArray(vao);
    context.uniformMatrix4fv(modelViewUniformLocation, false, mvMat);

    let count = 0;
    let nelements = 0;
    nmaterials = materials.length;
    materials.forEach(
        function (mat) {
            if (count == (nmaterials - 1))
                nelements = indices.length - slots[count];
            else
                nelements = slots[count + 1] - slots[count];

            // Update diffuse_color
            let diffuse = mat.diffuse_color;

            context.uniform3f(diffuseColorUniformLocation, diffuse[0], diffuse[1], diffuse[2]);
            context.drawElements(context.TRIANGLES,
                nelements,
                context.UNSIGNED_SHORT, slots[count] * Uint16Array.BYTES_PER_ELEMENT);

            count += 1;

        });

}


window.addEventListener("load", function (event) {
    init()
        .then(v => {
            console.log('Terminada la inicialización ' + v);
            return initbuffer();
        })
        .then(v => {
            if (v) {
                console.log('Terminada la inicialización de los buffer');
                initworld();
                return window.requestAnimationFrame(gameloop);
            }
        });
});

