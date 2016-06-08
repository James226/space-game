defmodule World.Tile.Supervisor do
  use Supervisor

  # A simple module attribute that stores the supervisor name
  @name World.Tile.Supervisor

  def start_link do
    Supervisor.start_link(__MODULE__, :ok, name: @name)
  end

  def start_bucket({x, y, z}) do
    Supervisor.start_child(@name, [{x, y, z}])
  end

  def init(:ok) do
    children = [
      worker(World.Tile, [], restart: :temporary)
    ]

    supervise(children, strategy: :simple_one_for_one)
  end
end
