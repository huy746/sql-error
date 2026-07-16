nickname = request.form["nickname"]

cursor.execute(
    "INSERT INTO users(nickname) VALUES(?)",
    (nickname,)
)

cursor.execute(
    "SELECT * FROM logs WHERE username = ?",
    (nickname,)
)
