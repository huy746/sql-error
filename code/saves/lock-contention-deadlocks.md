BEGIN;

UPDATE users
SET balance = balance - 100
WHERE id = 1;

COMMIT;
