const loadShader = (gl, type, source) => {
    // 创建着色器对象
    let shader = gl.createShader(type);
    if (shader == null) {
        console.log('无法创建着色器');
        return null;
    }
    // 设置着色器源代码
    gl.shaderSource(shader, source);
    // 编译着色器
    gl.compileShader(shader);
    // 检查着色器的编译状态
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        let error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};

const createProgram = (gl, vshader, fshader) => {
    // 创建着色器对象
    let vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
        return null;
    }
    // 创建程序对象
    let program = gl.createProgram();
    if (!program) {
        return null;
    }
    // 为程序对象分配顶点着色器和片元着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 连接着色器
    gl.linkProgram(program);
    // 检查连接
    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        let error = gl.getProgramInfoLog(program);
        console.log('无法连接程序对象: ' + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
    }
    return program;
};

const initShaders = (gl, vshader, fshader) => {
    const program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.log('无法创建程序对象');
        return false;
    }
    gl.useProgram(program);
    gl.program = program;
    return true;
};

const initVertexbuffer = (gl) => {
    // 顶点着色器的坐标与纹理坐标的映射
    const vertices = new Float32Array([
        -1, 1, 0.0, 1.0,
        -1, -1, 0.0, 0.0,
        1, 1, 1.0, 1.0,
        1, -1, 1.0, 0.0
    ]);
    // 创建缓冲区对象
    let vertexBuffer = gl.createBuffer();
    // 绑定buffer到缓冲对象上
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 向缓冲对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const FSIZE = Float32Array.BYTES_PER_ELEMENT;
    // 将缓冲区对象分配给a_Position变量
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    // 连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);
    // 将缓冲区对象分配给a_TexCoord变量
    let a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // 使用缓冲数据建立程序代码到着色器代码的联系
    gl.enableVertexAttribArray(a_TexCoord);
};

const initTexture = (gl, image) => {
    let texture = gl.createTexture()
    let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    // 对纹理图像进行y轴翻转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //将0号纹理传递给着色器的取样器变量
    gl.uniform1i(u_Sampler, 0);
};