{
  description = "Django Development Environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { nixpkgs, treefmt-nix, ... }:
    let
      supportedSystems = [ "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          python = pkgs.python312;
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.uv
              python
              pkgs.postgresql_16
            ];

            shellHook = ''
              export UV_PYTHON="${python}/bin/python"
              export UV_NO_MANAGED_PYTHON=1

              # Database Variables
              export PGDATA="$PWD/.postgres_data"
              export PGHOST="$PWD/.postgres_socket"
              export PGPORT="5433"
              export DATABASE_NAME="inventory_dev"
              export DATABASE_URL="postgres://$(whoami)@localhost:$PGPORT/$DATABASE_NAME"

              export LD_LIBRARY_PATH="${pkgs.postgresql.lib}/lib:$LD_LIBRARY_PATH"
              export PKG_CONFIG_PATH="${pkgs.postgresql}/lib/pkgconfig:$PKG_CONFIG_PATH"

              export PATH="$PWD/scripts:$PATH"

              source ./scripts/_boot_postgres.sh

              alias backend="uv run python manage.py runserver"

              echo "------------------------------------------------"
              echo " Django Environment Ready"
              echo "   Database: $DATABASE_URL"
              echo "   Commands: backend, db_reset.sh"
              echo "------------------------------------------------"
            '';
          };
        }
      );

      formatter = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        (treefmt-nix.lib.evalModule pkgs {
          projectRootFile = "flake.nix";
          programs = {
            # Nix
            nixfmt.enable = true;

            # Python
            ruff = {
              format = true;
              check = true;
            };

            # Docs/markdown
            prettier = {
              enable = true;
              settings = {
                proseWrap = "always";
              };
            };

            # Shell / Bash
            shfmt.enable = true;

            # Spelling
            typos.enable = true;
          };
        }).config.build.wrapper
      );
    };
}
