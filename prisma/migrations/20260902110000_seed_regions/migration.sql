-- Reference data: the 11 regions of Armenia.
-- svg_path_id values must match the path ids in the frontend map component
-- (components/shared/armenia-map.tsx).
-- Idempotent: rows whose slug already exists are skipped.
INSERT INTO "regions" ("id", "name", "slug", "svg_path_id", "created_at", "updated_at")
VALUES
    (gen_random_uuid()::text, 'Yerevan',     'yerevan',     'region-yerevan',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Aragatsotn',  'aragatsotn',  'region-aragatsotn',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Ararat',      'ararat',      'region-ararat',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Armavir',     'armavir',     'region-armavir',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Gegharkunik', 'gegharkunik', 'region-gegharkunik', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Kotayk',      'kotayk',      'region-kotayk',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Lori',        'lori',        'region-lori',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Shirak',      'shirak',      'region-shirak',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Syunik',      'syunik',      'region-syunik',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Tavush',      'tavush',      'region-tavush',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Vayots Dzor', 'vayots-dzor', 'region-vayots-dzor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
