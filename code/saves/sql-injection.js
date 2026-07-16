username = request.form["username"]

cursor.execute(
    "SELECT * FROM users WHERE username = ?",
    (username,)
)
