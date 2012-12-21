function MeshData() {
	this.wireframe = false;
	this.geoms = new Array();
	this.materials = new Array();
	this.meshes = new Array();
};

MeshData.prototype.getMeshes = function (mesh, wireframe_model) {
	var bodies = mesh;
	if (this.geoms.length === 0) {
        for(var i = 0; i < bodies.length; ++i) {
            var geom = new THREE.Geometry;
            var body = bodies[i];
            geom.id = body.id; // id
            geom.name = body.name; // name
            for(var j = 0; j < body.vertices.length; ++j) {
                geom.vertices.push(new THREE.Vector3(body.vertices[j].x, body.vertices[j].y, body.vertices[j].z));
            }
            for(var k = 0; k < body.faces.length; ++k) {
				var tri = body.faces[k];
				var normal = null;
				if (tri.normalIndex) {
					normal = new THREE.Vector3( body.normals[tri.normalIndex].x, body.normals[tri.normalIndex].y, body.normals[tri.normalIndex].z );
				}
				var face = new THREE.Face3( tri.vertexIndices[0], tri.vertexIndices[1], tri.vertexIndices[2], normal );
				geom.faces.push(face);
            }
			this.geoms.push(geom);
		}
	}
	
	if ( (wireframe_model !== this.wireframe) || (this.materials.length === 0 ) ) {
		this.wireframe = wireframe_model;
		for(var i = 0; i < bodies.length; ++i) {
			var body = bodies[i];
			var materials = new Array();
			var defaultMaterial = new THREE.MeshPhongMaterial({ ambient: 0x7ccd7c, color: 0x7ccd7c, wireframe: this.wireframe });
			materials.push( defaultMaterial );
			if (body.colors) {
                for (var q = 0; q < body.colors.length; ++q) {
                    var clr = new THREE.Color;
                    clr.setRGB(body.colors[q].r, body.colors[q].g, body.colors[q].b);
                    materials.push( new THREE.MeshPhongMaterial({ ambient: clr.getHex(), color: clr.getHex(), wireframe: this.wireframe }) );
                }
            }
			
			for(var k = 0; k < body.faces.length; ++k) {
				var tri = body.faces[k];
				if (tri.colorIndex) {
					this.geoms[i].faces[k].materialIndex = tri.colorIndex + 1;
				}
				else {
					this.geoms[i].faces[k].materialIndex = (materials.length > 1) ? 1 : 0;
				}
			}
			
			var faceMaterial = new THREE.MeshFaceMaterial(materials);
			if ( this.materials.length === 0 ) {
				this.materials.push(faceMaterial);
				var mesh = new THREE.Mesh(this.geoms[i], faceMaterial);
				this.meshes.push(mesh);
			}
			else {
				this.materials[i] = faceMaterial;
				this.meshes[i] = new THREE.Mesh(this.geoms[i], faceMaterial);
			}
		}
	}
	
	return this.meshes;
	
	/*var scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0xf0f0b5 ) );
    var light = new THREE.DirectionalLight( 0xf0f0b5, 0.8, 0 );
    light.position.set( 100, 200, 0 );
    scene.add( light );
	for (var i = 0; i < this.meshes.length; ++i) {
		scene.add(this.meshes[i]);
	}*/
	
	//return scene;
};