import { AmmoJSPlugin, Vector3 } from '@babylonjs/core'
import Ammo from 'ammojs-typed'
import { scene, engine, makeFPS } from './scene'
import { makeGround } from './ground'
import { makeShelf } from './shelf'
import { makeWare } from './warehouse'
import { makeBox } from './box'
import { makePallet } from './pallet'
import { makeConveyor } from './conveyor'
import { setUpGizmo } from './setUpGizmo'
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock, Image } from '@babylonjs/gui'


async function main(): Promise<void> {
    // var api = new handlers()
    // console.log("ssaa")
    // console.log(await api.getWithID("Shelf",3))
    // let data = await api.getWithID("Shelf",3)
    // console.log(data.content)
    const ammo = await Ammo()
    const physics: AmmoJSPlugin = new AmmoJSPlugin(true, ammo)
    scene.enablePhysics(new Vector3(0, -9.81, 0), physics)
    makePallet()
    makeWare()
    makeConveyor()
    makeShelf()
    makeGround()
    makeFPS()
    makeBox()
    setUpGizmo(scene)
    // run the main render loop
    engine.runRenderLoop(() => scene.render())
    window.addEventListener("resize", ()=>{
        engine.resize()
    })
}
// var advancedTextureLoading: AdvancedDynamicTexture
// var showLoadingScreen = function () {
//     advancedTextureLoading = AdvancedDynamicTexture.CreateFullscreenUI("loadingScreen");
    
//     var panel = new StackPanel();
//     panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
//     panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
//     advancedTextureLoading.addControl(panel);
  
//     var loadingText = new TextBlock();
//     loadingText.text = "Đang tải...";
//     loadingText.color = "white";
//     loadingText.fontSize = 24;
//     panel.addControl(loadingText);
  
//     var loadingSpinner = new Image("loadingSpinner", "loadingSpinner.png");
//     loadingSpinner.width = "64px";
//     loadingSpinner.height = "64px";
//     panel.addControl(loadingSpinner);
  
//     engine.loadingUIText = "Đang tải..."; // Hiển thị thông báo tải trong console
//   };
  
// var hideLoadingScreen = function () {
//     advancedTextureLoading.dispose()
// };
// showLoadingScreen()
// scene.onReadyObservable.addOnce(() => {
//     hideLoadingScreen()
// })

main()