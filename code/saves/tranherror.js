except Exception:
    logger.exception("Database Error")
    return "Internal Server Error"
