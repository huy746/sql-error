SELECT
    u.id,
    u.username,
    o.total
FROM users u
JOIN orders o
ON u.id = o.user_id
WHERE u.id = ?
LIMIT 20;
