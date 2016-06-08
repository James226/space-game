defmodule Webapp.RoomChannel do
  use Phoenix.Channel

  def join("rooms:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("rooms:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"message" => message}, socket) do
    broadcast! socket, "new_msg", %{message: message <> Game.WorldState.test }
    {:noreply, socket}
  end

  def handle_in("get_world_state", %{"x" => x, "y" => y, "z" => z}, socket) do
      {:ok, tile} = World.Registry.lookup(World.Registry, {x, y, z})
      {:ok, state} = World.Tile.get(tile)
      broadcast! socket, "world_state", %{state: state, position: %{x: x, y: y, z: z}}
      {:noreply, socket}
  end

  def handle_in("world.destroy", %{"x" => x, "y" => y, "z" => z}, socket) do
      {:ok, tile} = World.Registry.lookup(World.Registry, {Kernel.trunc(x / 32), Kernel.trunc(y / 32), Kernel.trunc(z / 32)})
      World.Tile.put(tile, {x, y, z}, 0)
      {:ok, state} = World.Tile.get(tile)
      broadcast! socket, "world_state", %{state: state, position: %{x: Kernel.trunc(x / 32), y: Kernel.trunc(y / 32), z: Kernel.trunc(z / 32)}}
      {:noreply, socket}
  end
end
