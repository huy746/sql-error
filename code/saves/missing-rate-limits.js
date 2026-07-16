// Flask
from flask_limiter import Limiter

limiter = Limiter(app=app)

@app.route("/login", methods=["POST"])
@limiter.limit("5/minute")
def login():
    ...

// Express.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5
});

app.use("/login", limiter);
