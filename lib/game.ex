defmodule Game do
  use Application, Amnesia

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    Amnesia.start
    Database.create disk: [node]

    children = [
      # Start the endpoint when the application starts
      supervisor(Game.Endpoint, []),

      supervisor(World.Supervisor, []),
      # Start the Ecto repository
      worker(Game.Repo, []),
      # Here you could define other workers and supervisors as children
      worker(Game.WorldState, []),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Game.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Game.Endpoint.config_change(changed, removed)
    :ok
  end
end
