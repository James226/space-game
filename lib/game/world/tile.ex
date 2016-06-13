defmodule World.Tile do
    use Database, Amnesia
  @doc """
  Starts a new bucket.
  """
  def start_link({_, y, _})  when y >= 0 do
    {:ok, tile} = Agent.start_link(fn -> [] end)

    Agent.update(tile, fn _ -> build_map(%{}, 0, 1) end)
    # Agent.update(tile, &Enum.update!(&1, ChunkSize, fn _ -> 1 end))
    {:ok, tile}
  end

  def start_link({_, y, _}) when y < 0 do
    Agent.start_link(fn -> build_map(%{}, 0, 0) end)
  end

  def build_map(map, 32, _) do
      map
  end

  def build_map(map, z, value) do
      build_map(Map.put(map, z, build_map_y(%{}, 0, value)), z + 1, value)
  end

  def build_map_y(map, 32, _) do
      map
  end

  def build_map_y(map, y, value) do
      build_map_y(Map.put(map, y, build_map_x(%{}, 0, value)), y + 1, value)
  end

  def build_map_x(map, 32, _) do
      map
  end

  def build_map_x(map, x, value) do
      build_map_x(Map.put(map, x, value), x + 1, value)
  end

  @doc """
  Gets a value from the `tile` by `key`.
  """
  def get(x, y, z) do
      Amnesia.transaction do
          position = to_string(x) <> "," <> to_string(y) <> "," <> to_string(z)
          IO.puts "Get position: " <> position
          state = Voxel.read position
          IO.puts "Got State"
          state = upsert_voxels state, position
          IO.puts "Written"
          {:ok, state}#Agent.get(tile, fn list -> list end)}
      end
  end

  def upsert_voxels(nil, position) do
      state = List.duplicate(1, 32*32*32)
      %Voxel{position: position, status: state}
      |> Voxel.write
      state
  end

  def upsert_voxels(state, position) do
      state
  end

  @doc """
  Puts the `value` for the given `key` in the `tile`.
  """
  def put({tileX, tileY, tileZ}, {x, y, z}, value) do
      IO.puts x
      IO.puts y
      IO.puts z
      Amnesia.transaction do
          position = to_string(tileX) <> "," <> to_string(tileY) <> "," <> to_string(tileZ)
          state = Voxel.read position
          state = upsert_voxels state, position
          key = x + y * 32 + z * 32 * 32
          newState = List.update_at(state.status, key, fn _ -> value end)
          %Voxel{position: position, status: newState}
          |> Voxel.write
      end
  end
end
