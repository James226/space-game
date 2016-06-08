defmodule Game.PageControllerTest do
  use Game.ConnCase

  test "GET /" do
    conn = get conn(), "/"
    assert html_response(conn, 200) =~ "Fullscreen"
  end
end
