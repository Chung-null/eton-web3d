import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { handlers } from './api/handlers';
import { InputText } from '@babylonjs/gui';
import { round2 } from './util';



export async function makePallet(): Promise<Mesh> {
    var startingPallet;
    var currentPallet;
    var outlinepallet;
    var position = 1;
    var pallet;
    var palletes = [];
    var gizmoManager = new GizmoManager(scene)

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
    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;
    let listeditshelf = advancedTexture.getControlByName("ListEditShelf");
    listeditshelf.isVisible = false;
    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");
    // handle API
    let handler = new handlers()

    async function syncPalletFromDB() {
        let allPalletOnDB = await handler.get("pallet")
        if (allPalletOnDB.status == 200) {
            allPalletOnDB.content.forEach(async function (element) {
                if (palletes.filter(pallet => pallet.id == element.id).length == 0) {// unique on array
                    let palletSync = await createPallet(element.id, new Vector3(element.x, element.y, element.z))
                    palletes.push(palletSync)
                }
            });
        }
    }
    async function createPallet(id, position: Vector3) {
        // Import the pallet
        const result = await SceneLoader.ImportMeshAsync(null, "pallet/", "palleteton.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        pallet = result.meshes[2]
        pallet.position = position
        pallet.id = id
        pallet.name = "pallet"
        return pallet
    }

    //Event click button Shelfinfo
    let buttonPallet = advancedTexture.getControlByName("ButtonPallet");
    buttonPallet.onPointerClickObservable.add(async () => {
        let positionPallet = new Vector3()
        // Adjust the position of the box
        if (position !== 1) {
            positionPallet.x += position;
        } else {
            positionPallet.x += 4;
        }

        position = positionPallet.x + 4;
        let resultPost = await handler.postPallet(positionPallet.x, positionPallet.y, positionPallet.z)
        if (resultPost.status == 201) {
            let pallet = await createPallet(resultPost.content.nid, positionPallet);
            palletes.push(pallet)
        }
    });

    var getGroundPositionPallet = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (pallet) { return pallet == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (pallet) {
        if (currentPallet) {
            // outlinepallet
            outlinepallet = currentPallet;
            outlinepallet.renderOutline = false;
            // gizmoManager.positionGizmoEnabled = false;
            location.isVisible = false
            txtXposition.text = "";
            txtYposition.text = "";
            txtZposition.text = "";
        }

        currentPallet = pallet;
        // currentPallet.material.wireframe = true;
        // outlinepallet
        outlinepallet = currentPallet;
        outlinepallet.outlineWidth = 0.2;
        outlinepallet.outlineColor = Color3.Green();
        outlinepallet.renderOutline = true;

        startingPallet = getGroundPositionPallet();
        if (startingPallet) { // we need to disconnect camera from canvas
            setTimeout(function () {
                camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = async function () {
        if (startingPallet) {
            // currentPallet.material.wireframe = false;

            // // outlinepallet
            outlinepallet = currentPallet;
            outlinepallet.renderOutline = false;
            camera.attachControl(canvas, true);
            startingPallet = null;

            // location.isVisible = true;
            txtXposition.text = round2(currentPallet.position.x) + ""
            txtYposition.text = round2(currentPallet.position.y) + ""
            txtZposition.text = round2(currentPallet.position.z) + ""
            if (currentPallet.id) {
                await handler.putPositionPallet(currentPallet.id, currentPallet.position.x, currentPallet.position.y, currentPallet.position.z)
            }
            return;
        }
    }
    var pointerMove = function () {
        // if (!startingPallet) {
        //     return;
        // }
        // var currentpallet = getGroundPositionPallet();
        // if (!currentpallet) {
        //     return;
        // }

        // var diff = currentpallet.subtract(startingPallet);
        // currentPallet.position.addInPlace(diff);

        // startingPallet = currentpallet;

    }
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:

                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    if (currentPallet) {
                        // currentPallet.material.wireframe = false;
                        // outline
                        outlinepallet = currentPallet;
                        outlinepallet.renderOutline = false;
                        // gizmoManager.positionGizmoEnabled = false
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";
                    }
                    // console.log("down");
                }
                break;
            case PointerEventTypes.POINTERUP:
                pointerUp();
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });
    // delete selected palletes
    // btndelete.onPointerClickObservable.add(async () => {
    //     if (currentPallet != null) {
    //         await handler.deletePallet(currentPallet.id)
    //         currentPallet.dispose();
    //         currentPallet = null;
    //     }
    // });

    // setInterval(syncPalletFromDB, 2000)
    await syncPalletFromDB()

    return pallet
}
