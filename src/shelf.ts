import { AbstractMesh, Camera, Color3, GizmoManager, HighlightLayer, Matrix, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, StandardMaterial, TransformNode, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { InputText } from '@babylonjs/gui';
import { ground } from './ground';
import { handlers } from './api/handlers';
import { generateUniqueRandom, round2 } from './util';

export async function makeShelf(): Promise<Mesh> {
    var startingPoint;
    var currentMesh;
    var outline;
    var mesh;
    var shelf = [];
    let offsetX = 0;
    let offsetY = 0;
    let offsetZ = 0;
    // check mesh in drag-area or not
    interface Position {
        x: number
        y: number
    }
    // check mesh in drag-area or not
    const isTargetIn = (startPosition, endPosition, target, camera) => {
        // get the screen XY of the target, converted from its world coordinate
        const targetScreenPosition = Vector3.Project(
            target,
            Matrix.IdentityReadOnly,
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(
                scene.getEngine().getRenderWidth(),
                scene.getEngine().getRenderHeight()
            )
        )

        const minX = Math.min(startPosition.x, endPosition.x)
        const minY = Math.min(startPosition.y, endPosition.y)
        const maxX = Math.max(startPosition.x, endPosition.x)
        const maxY = Math.max(startPosition.y, endPosition.y)

        // check if the target's screen XY is inside of the dragBox XY range or not
        if (
            targetScreenPosition.x >= minX &&
            targetScreenPosition.x <= maxX &&
            targetScreenPosition.y >= minY &&
            targetScreenPosition.y <= maxY
        ) {
            return true
        }
        return false
    }
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("D04P4Z#119");
    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;
    //Close all
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let listMenuBox = advancedTexture.getControlByName("ListMenuBox")
    listMenuBox.isVisible = false;
    let listeditshelf = advancedTexture.getControlByName("ListEditShelf");
    listeditshelf.isVisible = false;


    let buttonShelfware = advancedTexture.getControlByName("ButtonShelfware");
    let colorpickershelf = advancedTexture.getControlByName("ColorPicker") as GUI.ColorPicker;
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;


    let btnsaveshelf = advancedTexture.getControlByName("BtnSaveShelf");
    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let btncloseshelf = advancedTexture.getControlByName("BtnCloseShelf");
    let btneditshelf = advancedTexture.getControlByName("BtnEditShelf");

    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");
    //Get Info Shelf
    let txtNameInfo = <InputText>advancedTexture.getControlByName("InputNameShelfinfo");
    let txtWeightInfo = <InputText>advancedTexture.getControlByName("InputWeightShelfinfo");
    let txtaddColumn = <InputText>advancedTexture.getControlByName("InputTextColumn");
    let txtaddRow = <InputText>advancedTexture.getControlByName("InputTextRow");
    let txtaddDepth = <InputText>advancedTexture.getControlByName("InputTextDepth");
    //Edit Shelf
    let txteditnameshelf = <InputText>advancedTexture.getControlByName("InputEditNameShelf");

    // handle db 
    let handler = new handlers()
    var shelfMaterial = new StandardMaterial("shelfmat", scene);
    // Function to create a single shelf
    async function createShelf(offsetXX, offsetYY, offsetZZ) {
        const result = await SceneLoader.ImportMeshAsync(null, "shelf/", "shelfeton1.obj", scene);
        const randomNumber = generateUniqueRandom(Number.MAX_SAFE_INTEGER)


        mesh = result.meshes[0]
        console.log(result.meshes.length)
        mesh.position.x = offsetXX;
        mesh.position.y = offsetYY;
        mesh.position.z = offsetZZ;
        mesh.material = shelfMaterial;
        // handler.postShelf(name)

        return mesh;
    }
    async function createCompleteShelf() {
        // Retrieve the number of shelves from input text controls
        let addRow = parseInt(txtaddRow.text);
        let addColumn = parseInt(txtaddColumn.text);
        let addDepth = parseInt(txtaddDepth.text);
        let addWeightShelf = parseInt(txtWeightInfo.text);
        let addNameShelf = txtNameInfo.text
        if (addRow < 1 || addColumn < 1 || addDepth < 1 || addWeightShelf < 1) {
            alert("Các chỉ số của kệ hàng không được bỏ trống và không thể nhỏ hơn 1!")
            return
        }
        if (addNameShelf.trim() == "") {
            alert("Tên kệ hàng không được bỏ trống!")
            return
        }
        let resultPost = await handler.postShelf(addNameShelf, addWeightShelf, addColumn, addRow, addDepth, offsetX, offsetY, offsetZ)
        if (resultPost.status == 201) {
            let shelfImported = await importShelf(resultPost.content.nid, addNameShelf, addRow, addColumn, addDepth, offsetX, offsetY, offsetZ)
            shelf.push(shelfImported)
        }
    }
    async function importShelf(id, name, rows, columns, depth, offsetXA, offsetYA, offsetZA) {
        let meshesInShelf = []
        let offsetXX = Number(offsetXA)
        let offsetYY = Number(offsetYA)
        let offsetZZ = Number(offsetZA)
        let _offsetX = Number(offsetXA)
        let _offsetY = Number(offsetYA)
        let _offsetZ = Number(offsetZA)
        // Import the mesh
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                for (let k = 0; k < depth; k++) {
                    if (id == "58") {
                        console.log(offsetXX, offsetYY, offsetZZ)
                    }
                    let meshShelfCreated = await createShelf(offsetXX, offsetYY, offsetZZ);
                    meshesInShelf.push(meshShelfCreated)
                    offsetZZ += 2;
                }
                offsetZZ = _offsetZ;
                offsetYY += 2;
            }
            offsetZZ = _offsetZ;
            offsetYY = _offsetY;
            offsetXX += 1;
        }

        // Reset input text values
        txtaddColumn.text = "";
        txtaddRow.text = "";
        txtaddDepth.text = "";
        if (meshesInShelf.length > 0) {
            var totalPosition = new Vector3();
            for (var i = 0; i < meshesInShelf.length; i++) {
                totalPosition.addInPlace(meshesInShelf[i].position);
              }
              
              // Tính vị trí trung bình
            var averagePosition = totalPosition.scale(1 / meshesInShelf.length);
            var groupMesh = Mesh.MergeMeshes(meshesInShelf);
            // Di chuyển các mesh con về vị trí trung bình
            for (var i = 0; i < meshesInShelf.length; i++) {
                meshesInShelf[i].position.subtractInPlace(averagePosition);
            }
            groupMesh.name = "shelf" + name
            groupMesh.id = id
            return groupMesh
        }
        return new Mesh("")
    }
    async function syncShelfFromDB() {
        let allShelfOnDB = await handler.get("shelf")
        if (allShelfOnDB.status == 200) {
            allShelfOnDB.content.forEach(async function (element) {
                if (shelf.filter(_shelf => _shelf.id == element.id).length == 0) {// unique on array
                    let shelfSync = await importShelf(element.id, element.name, element.field_rows, element.field_columns, element.field_depth, element.x, element.y, element.z)
                    if (shelfSync.name != "") {
                        console.log(shelf)
                        shelf.push(shelfSync)
                    }
                }
            });
        }
    }
    buttonShelfware.onPointerClickObservable.add(() => {
        listMenuBox.isVisible = false;
        listMenuShelf.isVisible = true;
    });

    colorpickershelf.value = shelfMaterial.diffuseColor;
    buttonShelfware.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    colorpickershelf.onValueChangedObservable.add(function (value) {
        shelfMaterial.diffuseColor.copyFrom(value);
    });
    btnsaveshelf.onPointerClickObservable.add(async () => {
        try {
            await createCompleteShelf()
            listMenuShelf.isVisible = false
        }
        catch (e) {
            alert("Có lỗi xảy ra! Có thể nguyên nhân là do bạn để trống thuộc tính nào đó")
        }
    })
    // btneditshelf.onPointerClickObservable.add(async () => {
    //     currentMesh.name = txteditnameshelf
    //     await handler.putNameShelf(currentMesh.id, txteditnameshelf.text)
    //     listeditshelf.isVisible = false;
    // })
    btncloseshelf.onPointerUpObservable.add(() => {
        listMenuShelf.isVisible = false;
    });

    var getGroundPositionShelf = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (mesh: AbstractMesh) {
        try {
            if (mesh) {
                if (mesh.name.toLowerCase().includes("shelf")) {
                    if (currentMesh) {
                        // outline
                        outline = currentMesh;
                        outline.renderOutline = false;
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";

                        listeditshelf.isVisible = false;
                        txteditnameshelf.text = "";


                    }


                    currentMesh = mesh;
                    // outline
                    outline = currentMesh;
                    outline.outlineWidth = 0.2;
                    outline.outlineColor = Color3.Green();
                    outline.renderOutline = true;

                    startingPoint = getGroundPositionShelf();
                    if (startingPoint) { // we need to disconnect camera from canvas
                        setTimeout(function () {
                            camera.detachControl(canvas);
                        }, 0);

                    }
                }
                else {

                }
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    var pointerUp = async function (mesh: AbstractMesh) {
        try {
            if (startingPoint) {
                // currentMesh.material.wireframe = false;

                // // outline
                outline = currentMesh;
                outline.renderOutline = false;
                camera.attachControl(canvas, true)

                // location.isVisible = true;
                txtXposition.text = round2(currentMesh.position.x) + ""
                txtYposition.text = round2(currentMesh.position.y) + ""
                txtZposition.text = round2(currentMesh.position.z) + ""

                // listeditshelf.isVisible = true;
                txteditnameshelf.text = currentMesh.name.toString().replace("shelf", "");
                if (currentMesh.id) {
                    await handler.putPositionShelf(currentMesh.id, currentMesh.position.x, currentMesh.position.y, currentMesh.position.z)
                }
                //camera.attachControl(canvas, true);
                startingPoint = null;

                return;
            }
        } catch (e) {
            console.log(e)
        }
    }
    var pointerMove = function () {
        // if (!startingPoint) {
        //     return;
        // }
        // var curreenShelf = getGroundPositionShelf();
        // if (!curreenShelf) {
        //     return;
        // }

        // var diff = curreenShelf.subtract(startingPoint);
        // currentMesh.position.addInPlace(diff);

        // startingPoint = curreenShelf;

    }
    scene.onPointerObservable.add(async (pointerInfo, event) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:

                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh);

                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    if (currentMesh) {
                        // currentMesh.material.wireframe = false;
                        // outline
                        outline = currentMesh;
                        outline.renderOutline = false;
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";
                        listeditshelf.isVisible = false;
                        txteditnameshelf.text = "";
                    }
                    // console.log("down");
                }
                else if (pointerInfo.pickInfo.pickedMesh == ground && pointerInfo.event.button == 0) {
                    var vector = pointerInfo.pickInfo.pickedPoint;
                    console.log('left mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z);
                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    var vector = pointerInfo.pickInfo.pickedPoint;

                    console.log('ground click: ' + vector.x + ',' + vector.y + ',' + vector.z);
                    console.log("pointer info: " + pointerInfo.event.button);
                }

                break;
            case PointerEventTypes.POINTERUP:
                await pointerUp(pointerInfo.pickInfo.pickedMesh);
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });
    //sync db
    syncShelfFromDB()
    // delete selected meshes
    btndelete.onPointerClickObservable.add(async () => {
        if (currentMesh != null) {
            await handler.deleteShelf(currentMesh.id)
            currentMesh.dispose();
            currentMesh = null;
        }
        listeditshelf.isVisible = false;
    });


    return mesh
}