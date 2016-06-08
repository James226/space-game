defmodule World.RegistryTest do
  use ExUnit.Case, async: true

  setup context do
    {:ok, registry} = World.Registry.start_link(context.test)
    {:ok, registry: registry}
  end

  test "spawns buckets", %{registry: registry} do
    assert World.Registry.lookup(registry, {0, 0, 0}) == :error

    World.Registry.create(registry, {0, 0, 0})
    assert {:ok, bucket} = World.Registry.lookup(registry, {0, 0, 0})

    World.Tile.put(bucket, "milk", 1)
    assert World.Tile.get(bucket, "milk") == 1
  end

  test "removes buckets on exit", %{registry: registry} do
    World.Registry.create(registry, {0, 0, 0})
    {:ok, bucket} = World.Registry.lookup(registry, {0, 0, 0})
    Agent.stop(bucket)
    assert World.Registry.lookup(registry, {0, 0, 0}) == :error
  end
end
