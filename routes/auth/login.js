const jwt = require('jsonwebtoken');

const User = require('../../models/user');

const loginUser = async (req, res, next) => {
    try {
        let payload = { userId: req.user._id, access: req.user.access === "user" ? 10 : 0 };
        let token = jwt.sign(payload, 'verySecret');
        res.status(200).json({
            "message": "Authenticated",
            "data": token
        });

        // Logging
        if (req.user.access === "user") {
            let accessHistory = {
                accessOn: new Date,
                from: req.connection.remoteAddress.split(':')[3],
                agent: req.useragent.source
            }
            await User.findOneAndUpdate({ _id: req.user._id }, { $push: { "history.lastLogin": accessHistory } }).catch();
        }
    } catch (err) {
        next(err);
    }
}

module.exports = loginUser;