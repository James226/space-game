defmodule World.Tile do
  @doc """
  Starts a new bucket.
  """
  def start_link({_, y, _})  when y >= 0 do
    {:ok, tile} = Agent.start_link(fn -> [] end)

    Agent.update(tile, fn _ -> List.duplicate(1, 32 * 32 * 32) end)
    # Agent.update(tile, &Enum.update!(&1, ChunkSize, fn _ -> 1 end))
    {:ok, tile}
  end

  def start_link({_, y, _}) when y < 0 do
    Agent.start_link(fn -> List.duplicate(0, 32 * 32 * 32) end)
  end

  @doc """
  Gets a value from the `tile` by `key`.
  """
  def get(tile) do
    {:ok, Agent.get(tile, fn list -> list end)}
  end

  @doc """
  Puts the `value` for the given `key` in the `tile`.
  """
  def put(tile, {x, y, z}, value) do
    key = x + y * 32 + z * 32 * 32
    Agent.update(tile, &List.update_at(&1, key, fn _ -> value end))
  end
end
