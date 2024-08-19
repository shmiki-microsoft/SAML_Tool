function handleError(res, err, message) {
    console.error(err);
    res.status(500).render('error', { message, error: err });
}

module.exports = handleError;