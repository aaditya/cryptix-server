const Question = require('../../models/questions');
const User = require('../../models/user');

const getQuestion = async (req, res, next) => {
    try {
        let { history } = req.info;

        let start = 1;
        let qcount = 0;

        let levelInfo;
        let latestHistory = history.slice(-1)[0];

        if (latestHistory) {
            levelInfo = await Question.findOne({ level: latestHistory.last });
            qcount = latestHistory.question.length;
            if (qcount === levelInfo.total) {
                levelInfo = await Question.findOne({ level: latestHistory.last + 1 });
            }
        } else {
            levelInfo = await Question.findOne({ level: start });
        }

        if (latestHistory && latestHistory.last > 0 && !levelInfo) {
            await User.findOneAndUpdate({ _id: req.info.id }, { $set: { status: 3 } });
            return res.status(200).json({ "message": "Hunt Completed. Congratulations !", data: {} });
        }

        let selected = levelInfo.questions.filter(q => {
            if (latestHistory && !latestHistory.question.includes(q._id)) {
                return true;
            } else if (!latestHistory) {
                return true;
            } else {
                return false;
            }
        })[0];

        if (!selected) {
            return res.status(200).json({ "message": "No further questions.", data: {} });
        }

        return res.status(200).json({
            "message": "Question",
            "data": {
                lid: levelInfo._id,
                qid: selected._id,
                level: levelInfo.level,
                question: selected.text,
                type: selected.qType,
                hints: selected.hints
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getQuestion;