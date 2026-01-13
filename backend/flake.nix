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
            ];

            shellHook = ''
              export UV_PYTHON="${python}/bin/python"
              export UV_NO_MANAGED_PYTHON=1

              echo "uv: $(uv --version)"
              echo "python: $(${python}/bin/python --version)"
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

            # Spelling
            typos.enable = true;
          };
        }).config.build.wrapper
      );
    };
}
