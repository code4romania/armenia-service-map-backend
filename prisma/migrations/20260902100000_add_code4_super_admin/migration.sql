-- Bootstrap super admin for staging/production.
-- Idempotent: skipped if the email already exists.
INSERT INTO "users" (
    "id",
    "email",
    "password_hash",
    "first_name",
    "last_name",
    "status",
    "role",
    "created_at",
    "updated_at"
)
VALUES (
    gen_random_uuid()::text,
    'admin@code4.ro',
    '$2b$10$c0754J74aNVjqWV5e9zWr.QuHPHVZnjnQ28jt8ywTdh6lVcM7Vm6y',
    'Code4',
    'Admin',
    'ACTIVE',
    'SUPER_ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;
