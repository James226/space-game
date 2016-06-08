defmodule World.TileTest do
  use ExUnit.Case, async: true

  test "stores values by key" do
    {:ok, tile} = World.Tile.start_link
    assert World.Tile.get(tile, "milk") == nil

    World.Tile.put(tile, "milk", 3)
    assert World.Tile.get(tile, "milk") == 3
  end
end
