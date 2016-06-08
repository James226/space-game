defmodule World.Registry do
  use GenServer

  ## Client API

  @doc """
  Starts the registry.
  """
  def start_link(name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  @doc """
  Looks up the bucket pid for `name` stored in `server`.
  """
  def lookup(server, {x, y, z}) do
    GenServer.call(server, {:lookup, {x, y, z}})
  end

  ## Server Callbacks

  def init(:ok) do
    names = %{}
    refs = %{}
    {:ok, {names, refs}}
  end

  def handle_call({:lookup, name}, _from, {names, refs} = state) do
    if Map.has_key?(names, name) do
      {:reply, Map.fetch(names, name), {names, refs}}
    else
      {:ok, pid} = World.Tile.Supervisor.start_bucket(name)
      ref = Process.monitor(pid)
      refs = Map.put(refs, ref, name)
      names = Map.put(names, name, pid)
      {:reply, {:ok, pid}, {names, refs}}
    end
  end

  def handle_info({:DOWN, ref, :process, _pid, _reason}, {names, refs}) do
    {name, refs} = Map.pop(refs, ref)
    names = Map.delete(names, name)
    {:noreply, {names, refs}}
  end

  def handle_info(_msg, state) do
    {:noreply, state}
  end
end
