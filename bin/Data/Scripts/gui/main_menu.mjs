// Main menu scripts are here
import * as common from "./gui_common.mjs";
import * as microbe_hud from "./microbe_hud.mjs";
import {setupMicrobeEditor} from "./microbe_editor.mjs";

// eslint off
// import {doEnterMicrobeEditor} from "./microbe_editor.mjs";
// eslint on

let jams = null;

// Pauses the menu music instantly (used for instant start)
let menuAlreadySkipped = false;

//! Setup callbacks for buttons
export function runMenuSetup(){

    document.getElementById("quitButton").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        quitGame();
    }, true);
    document.getElementById("newGameButton").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        newGame();
    }, true);
    document.getElementById("extrasButton").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        $("#mainMenu").slideUp("fast", () => {
            $("#extrasMenu").slideDown("fast");
        });
    }, true);
    document.getElementById("backFromExtras").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        $("#extrasMenu").slideUp("fast", () => {
            $("#mainMenu").slideDown("fast");
        });
    }, true);
    document.getElementById("toMultiplayerProtoButton").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        $("#extrasMenu").slideUp("fast", () => {
            $("#serverConnectingMenu").slideDown("fast");
        });
    }, true);
    document.getElementById("backFromConnecting").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        $("#serverConnectingMenu").slideUp("fast", () => {
            $("#extrasMenu").slideDown("fast");
        });
    }, true);
    document.getElementById("backFromConnecting").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        $("#serverConnectingMenu").slideUp("fast", () => {
            $("#extrasMenu").slideDown("fast");
        });
    }, true);
    document.getElementById("connectToServerButton").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        connectToSelectedServerURL();
    }, true);
    document.getElementById("disconnectFromServer").addEventListener("click", (event) => {
        event.stopPropagation();
        common.playButtonPressSound();
        disconnectFromCurrentServer();
    }, true);


    document.addEventListener("keydown", (event) => {
        if(event.key === "Escape"){

            event.stopPropagation();
            onEscapePressed();

        }
    }, true);

    // Some setup cannot be ran when previewing in a browser
    if(common.isInEngine()){

        // Version number
        Thrive.getVersion((result) => {

            document.getElementById("versionNumber").textContent = result;

        }, () => {});

        // Detect return to menu
        Leviathan.OnGeneric("ExitedToMenu", () => {
            doExitToMenu();
        });

        Leviathan.OnGeneric("MicrobeStageEnteredClient", () => {
            switchToMicrobeHUD();
        });

        // Server status message display
        Leviathan.OnGeneric("ConnectStatusMessage", (event, vars) => {
            handleConnectionStatusEvent(vars);
        });

        // Start intro video
        Leviathan.PlayCutscene("Data/Videos/intro.mkv", onIntroEnded, onIntroEnded);

    } else {
        document.getElementById("versionNumber").textContent = "Thrive GUI in browser";

        // Background to be black to fix the white text and cursor not showing up well
        document.getElementsByTagName("body")[0].style.background = "black";

        // (this would theoretically work in a browser but would be a bit annoying to work on)
        // common.playVideo("../../Videos/intro.mkv", onIntroEnded);
    }

    // This is ran immediately because this needs to register
    // callbacks that will be called before finishing entering the
    // editor
    setupMicrobeEditor();

    //
    // Use these to immediately test some specific menu
    //

    // eslint off

    // Test directly going to the stage
    // onMicrobeIntroEnded();

    // Test going to the editor (also uncomment the function call above)
    // Thrive.editorButtonClicked();

    // For in-browser preview
    // doEnterMicrobeEditor();

    // Skip intro video
    // onIntroEnded();

    // eslint on
}

function startMenuMusic(restart = true) {
    if(!common.isInEngine())
        return;

    if(jams && restart){

        // Stop already playing
        jams.Stop();
        jams = null;
    }

    if(!jams){

        const startPaused = Boolean(menuAlreadySkipped);

        // Start the menu music
        Leviathan.Play2DSound("Data/Sound/main-menu-theme-2.ogg", true, startPaused,
            (source) => {
                jams = source;
            });
    } else {
        jams.Play2D();
    }
}

//! Handles pressing Escape in the GUI (this will unpause the game,
//! pausing is initiated from c++ key listener)
function onEscapePressed() {
    // TODO: move this to the cutscene player
    Leviathan.CancelCutscene();
}

function onIntroEnded(error) {

    if(error)
        console.error("failed to play intro video: " + error);

    if(common.isInEngine()){

        startMenuMusic();
    }
}

function quitGame(){
    common.requireEngine();
    Leviathan.Quit();
}

function newGame(){
    if(jams){
        jams.Pause();
    }
    if(common.isInEngine()){
        Leviathan.PlayCutscene("Data/Videos/MicrobeIntro.mkv", onMicrobeIntroEnded,
            onMicrobeIntroEnded);
    } else {
        onMicrobeIntroEnded();
    }
}

function connectToSelectedServerURL(){
    // The url is from this textbox
    const url = document.getElementById("connectServerURLInput").value;

    if(!url)
        return;

    if(common.isInEngine()){

        Thrive.connectToServer(url);

    } else {

        handleConnectionStatusEvent({
            show: true, server: url,
            message: "This is the GUI in a browser and can't actually connect"
        });
    }
}

function disconnectFromCurrentServer(){
    if(common.isInEngine()){

        Thrive.disconnectFromServer();

    } else {

        handleConnectionStatusEvent({show: false});
    }

    // ThriveGame handles moving back to the menu GUI
}

function handleConnectionStatusEvent(event){
    if(event.show){
        document.getElementById("serverConnectPopup").style.display = "flex";
    } else {
        document.getElementById("serverConnectPopup").style.display = "none";
    }

    if(event.server)
        document.getElementById("currentServerAddress").innerText = event.server;
    document.getElementById("currentConnectionStatusMessage").innerText = event.message;
}

function onMicrobeIntroEnded(error){

    if(error)
        console.error("failed to play microbe intro video: " + error);

    menuAlreadySkipped = true;

    if(common.isInEngine()){

        // Make sure no video is playing in case we did an immediate start
        Leviathan.CancelCutscene();

        Thrive.start();

    } else {

        // Show the microbe GUI anyway for testing purposes
    }

    switchToMicrobeHUD();
}

function switchToMicrobeHUD(){

    // Stop menu music
    if(jams){

        jams.Pause();
    }

    // Hide main menu
    // If this is ever restored this needs to be set to "flex"
    document.getElementById("topLevelMenuContainer").style.display = "none";

    // And show microbe gui
    document.getElementById("topLevelMicrobeStage").style.display = "block";
    microbe_hud.runMicrobeHUDSetup();
}

//! Called once C++ has finished exiting to menu
export function doExitToMenu() {
    document.getElementById("topLevelMenuContainer").style.display = "";
    document.getElementById("topLevelMicrobeEditor").style.display = "none";
    document.getElementById("topLevelMicrobeStage").style.display = "none";
    document.getElementById("pauseOverlay").style.display = "none";

    startMenuMusic(false);
}

