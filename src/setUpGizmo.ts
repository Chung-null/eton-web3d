import { Scene, AbstractMesh, GizmoManager, PointerEventTypes, PositionGizmo } from "@babylonjs/core";
import { ground } from "./ground";
import { handlers } from "./api/handlers";
import { InputText } from "@babylonjs/gui";
import { advancedTexture } from "./box";
import { getCurrentDate, round2 } from "./util";

export async function setUpGizmo(scene: Scene) {
    let currentMesh: AbstractMesh = null;
    let gizmoManager = new GizmoManager(scene)
    let handler = new handlers()
    let checkAdded = false
    await advancedTexture.parseFromSnippetAsync("D04P4Z#119"); //L91IFF#73, L91IFF#76, L91IFF#75
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let listMenuBox = advancedTexture.getControlByName("ListMenuBox");
    listMenuBox.dispose()
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;
    let listeditshelf = advancedTexture.getControlByName("ListEditShelf");
    listeditshelf.isVisible = false;
    let buttonListBox = advancedTexture.getControlByName("ButtonBox");
    //Button Edit Box
    let btneditnamebox = advancedTexture.getControlByName("ButtonEditBox");
    let btnexportbox = advancedTexture.getControlByName("ButtonExportBox");
    let btneditshelf = advancedTexture.getControlByName("BtnEditShelf");
    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");
    // Edit Box Name
    let txteditnamebox = <InputText>advancedTexture.getControlByName("InputNameExportBox");
    let txteditnameshelf = <InputText>advancedTexture.getControlByName("InputEditNameShelf");
    let btndelete = advancedTexture.getControlByName("BtnDelete");
    //Event click button Shelfinfo
    buttonListBox.onPointerClickObservable.add(() => {
        listMenuBox.isVisible = true;
    });
    btneditnamebox.onPointerClickObservable.add(async () => {
        if (currentMesh && currentMesh.name.toLowerCase().includes("box")) {
            currentMesh.name = "box" + txteditnamebox.text
            await handler.putNameBox(Number(currentMesh.id), txteditnamebox.text)
        }
    })
    btnexportbox.onPointerClickObservable.add(async () => {
        if (currentMesh && currentMesh.name.toLowerCase().includes("box")) {
            await handler.putExportBox(Number(currentMesh.id), getCurrentDate().toString())
            currentMesh.setEnabled(false);
            listexportbox.isVisible = false;
            location.isVisible = false
            listexportbox.isVisible = false
            gizmoManager.positionGizmoEnabled = false
            currentMesh.dispose();
            currentMesh = null;
        }
    })
    btneditshelf.onPointerClickObservable.add(async () => {
        if (currentMesh && currentMesh.name.toLowerCase().includes("shelf")) {
            currentMesh.name = "shelf" + txteditnameshelf.text
            await handler.putNameShelf(Number(currentMesh.id), txteditnameshelf.text)
            listeditshelf.isVisible = false;
        }
    })
    btndelete.onPointerClickObservable.add(async () => {
        if (currentMesh != null) {
            await handler.deleteBox(Number(currentMesh.id))
            currentMesh.dispose();
            currentMesh = null;
        }
        gizmoManager.positionGizmoEnabled = false
        listexportbox.isVisible = false;
    });
    try {
        scene.onPointerObservable.add(async (pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.pickInfo.pickedMesh == ground) {
                        gizmoManager.positionGizmoEnabled = false
                        currentMesh = null
                        location.isVisible = false
                        listexportbox.isVisible = false
                        listeditshelf.isVisible = false
                    }
                    else {
                        currentMesh = pointerInfo.pickInfo.pickedMesh
                        if (currentMesh) {
                            location.isVisible = true
                            txtXposition.text = round2(currentMesh.position.x) + ""
                            txtYposition.text = round2(currentMesh.position.y) + ""
                            txtZposition.text = round2(currentMesh.position.z) + ""
                            if (currentMesh.name) {
                                if (currentMesh.name.toLowerCase().includes("box")) {
                                    listexportbox.isVisible = true
                                    txteditnamebox.text = currentMesh.name.toString().replace("box", "");
                                }
                                else {
                                    listexportbox.isVisible = false
                                    if (currentMesh.name.toLowerCase().includes("shelf")) {
                                        listeditshelf.isVisible = true
                                        txteditnameshelf.text = currentMesh.name.toString().replace("shelf", "");
                                    }
                                }
                            }
                        }
                    }
                    break;
                case PointerEventTypes.POINTERUP:
                    if (currentMesh) {
                        if (gizmoManager.positionGizmoEnabled) {
                            gizmoManager.positionGizmoEnabled = false
                        }
                        gizmoManager.positionGizmoEnabled = true
                        gizmoManager.attachToMesh(currentMesh)
                        if (!currentMesh.name.toLowerCase().includes("box")) {
                            gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = false
                        }
                        else {
                            gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = true
                        }
                        if (!gizmoManager.gizmos.positionGizmo.onDragEndObservable.hasObservers()) {
                            gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(async () => {
                                let position = gizmoManager.gizmos.positionGizmo.attachedMesh.position
                                // location.isVisible = true;
                                txtXposition.text = round2(position.x) + ""
                                txtYposition.text = round2(position.y) + ""
                                txtZposition.text = round2(position.z) + ""
                                if (currentMesh.name.toLowerCase().includes("box")) {
                                    let result = await handler.putPositionBox(Number.parseInt(currentMesh.id), currentMesh.position.x, currentMesh.position.y, currentMesh.position.z)
                                    console.log(result)
                                    return
                                }
                                if (currentMesh.name.toLowerCase().includes("shelf")) {
                                    await handler.putPositionShelf(Number.parseInt(currentMesh.id), currentMesh.position.x, currentMesh.position.y, currentMesh.position.z)
                                    return
                                }
                                if (currentMesh.name.toLowerCase().includes("pallet")) {
                                    await handler.putPositionPallet(Number.parseInt(currentMesh.id), currentMesh.position.x, currentMesh.position.y, currentMesh.position.z)
                                    return
                                }
                                if (currentMesh.name.toLowerCase().includes("conveyor")) {
                                    await handler.putPositionConveyor(Number.parseInt(currentMesh.id), currentMesh.position.x, currentMesh.position.y, currentMesh.position.z)
                                    return
                                }
                                if (currentMesh.name.toLowerCase().includes("warehouse")) {
                                    await handler.putPositionWarehouse(Number.parseInt(currentMesh.id), currentMesh.position.x, currentMesh.position.y, currentMesh.position.z)
                                    return
                                }
                            })
                        }
                    }
                    break;
            }
        });
    }
    catch (e) {
        console.log(e)
    }
}
