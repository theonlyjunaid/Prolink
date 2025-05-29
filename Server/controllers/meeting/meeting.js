const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {

    const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;


    const meeting = new MeetingHistory({ agenda, location, related, dateTime, notes, createBy });

    if (attendesLead.length > 0) {
        meeting.attendesLead = attendesLead;
    }

    if (attendes.length > 0) {
        meeting.attendes = attendes;
    }

    await meeting.save();

    res.status(200).json({ message: "Meeting added successfully", meeting });

}

const index = async (req, res) => {
    query = req.query;
    query.deleted = false;
    if (query.createBy) {
        query.createBy = new mongoose.Types.ObjectId(query.createBy);
    }

    try {
        let result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createdByName: '$users.username',
                }
            },
            { $project: { users: 0 } },
        ]);
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to fetch data" });
    }

}

const view = async (req, res) => {
    const { id } = req.params;
    try {
        let result = await MeetingHistory.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createdByName: '$users.username',
                }
            },
            { $project: { users: 0 } },
        ]);
        res.status(200).json(result[0]);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to fetch data" });
    }
}

const deleteData = async (req, res) => {

    const { id } = req.params;
    try {
        let result = await MeetingHistory.findByIdAndUpdate(id, { deleted: true }, { new: true });
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to delete data" });
    }
}

const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });

        if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
            return res.status(200).json({ message: "Meetings Removed successfully", result });
        }
        else {
            return res.status(404).json({ success: false, message: "Failed to remove tasks" })
        }

    } catch (err) {
        return res.status(404).json({ success: false, message: "error", err });
    }
}

module.exports = { add, index, view, deleteData, deleteMany }