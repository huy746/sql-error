username = request.form["username"]

cursor.execute(
    "SELECT * FROM users WHERE username = ?",
    (username,)
)

user = cursor.fetchone()

if user:
    return {"success": True}
else:
    return {"success": False}
