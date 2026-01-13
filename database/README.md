### installation

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install sqlx
```

### what does SQLX
- **Automated Schema Management:** Allow users to interact with database structure without a direct connection.
- **Version Control**: Provides a clear log of database modifications (migrations), making it easy to track history and collaborate.

### how to

- Create a Migrate

```bash
sqlx migrate add <name_of_migration>

# Example:
# sqlx migrate add refactor_users_new_attribute_phone
```
Then insert your sql query into the genereated file under `database/migrations/`

- Sync Database with the latest update:

```bash
sqlx migrate run
```

> NOTE While docker/nix is under intergration, .env need to be read and feed to sqlx by:
>
> - 1. export manuel
>      `export DATABASE_URL=""`
> - 2. with a helper which read from .env by adding "dotenvy" front of sqlx: requier dontenvy to be install into your system:
>      `cargo install dotenvy --features="cli"`
