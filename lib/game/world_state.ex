defmodule Game.WorldState do
    def start_link do
        Agent.start_link(fn -> %{} end, name: __MODULE__)
    end

    def test do
        "test11"
    end
end
