-- Reference data: two target groups requested by the client (LGBT persons, people with HIV).
-- Names are English; the frontend localises them via the `targetGroups` i18n namespace
-- (`LGBT Persons` -> `lgbtPersons`, `People with HIV` -> `peopleWithHiv`).
-- Idempotent: skipped when a group with the same name (case-insensitive) already exists.
INSERT INTO "target_groups" ("id", "name", "status", "created_at", "updated_at")
SELECT gen_random_uuid()::text, v.name, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES ('LGBT Persons'), ('People with HIV')) AS v(name)
WHERE NOT EXISTS (
    SELECT 1 FROM "target_groups" tg WHERE lower(tg."name") = lower(v.name)
);
