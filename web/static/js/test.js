import "deps/phoenix_html/web/static/js/phoenix_html"

import socket from "./socket"

export default function() {
    var lobby = socket.socket.channel("rooms:lobby", {})
    lobby.join()
      .receive("ok", resp => {
          console.log("Joined successfully", resp)
       })
      .receive("error", resp => { console.log("Unable to join", resp) })

    console.log('App initialized1111.');

    lobby.on("world_state", ({state: state, position}) => {
        console.log(state);
    });

    document.getElementById('go').onclick =  () => {
        lobby.push("get_world_state", { x: 0, y: 0, z: 0 });
    };
}
