BEGIN;

UPDATE users
SET balance = balance - 100
WHERE id = 1;

UPDATE orders
SET status = 'paid'
WHERE id = 10;

COMMIT;
