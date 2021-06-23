// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
import {Socket, Presence} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html"

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

window.id = uuidv4();
window.room = document.getElementById("room_id").innerHTML;

window.history.pushState({page: "same"}, "same page", "/?id=" + window.room);

let socket = new Socket("/socket", {
    logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }),
    params: {user_id: window.id, room_id: window.room}
})






// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("music:" + window.room, {})

let presence = new Presence(channel)

function renderOnlineUsers(presence) {
    let response = ""
  
    presence.list((id, {metas: [first, ...rest]}) => {
      let count = rest.length + 1
      response += `<li>${id}</li>`
    })
  
    DOM.aboutPopupContent.getElementsByTagName("ul").online_list.innerHTML = response;
}

  window.renderOnlineUsers = renderOnlineUsers;
  
  
presence.onSync(() => renderOnlineUsers(presence))

window.presence = presence;

socket.connect();
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

channel.on("new:msg", (msg) => {
    if(msg["packets"] != undefined) {
        const packets = msg["packets"];
        packets.forEach(packet => {
            const p = JSON.parse(packet);
            DAW.callActionNoSend(p["action"], ...p["args"])
        });
        return;
    }
    if(msg["id"] == window.id)
        return;
    if(msg["play"] != undefined && msg["play"] == true) {
        DAW.play();
        return;
    } else if(msg["play"] != undefined && msg["play"] == false) {
        DAW.pause();
        return;
    }
    if(msg["stop"] != undefined && msg["stop"] == true){
        DAW.stop();
        return;
    }
    if(msg["action"] != undefined && msg["args"] != undefined) {
        if(msg["args"].includes(undefined)){
            return;
        }
        DAW.callActionNoSend(msg["action"], ...msg["args"])
        return;
    }
    if(msg["composition_mode"] != undefined && msg["composition_mode"] != true) {
        document.getElementById("playToggle").setAttribute("data-dir", "up")
        DAW.compositionFocus( "-f" );
        return;
    } else if (msg["composition_mode"] != undefined && msg["composition_mode"] != false) {
        document.getElementById("playToggle").setAttribute("data-dir", "down")
        DAW.pianorollFocus( "-f" );
        return;
    }

    
    
})

window.socket = socket;
window.channel = channel;



require("../../daw/src/run.js")