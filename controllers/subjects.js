

const Subject = require('../models/subject');

exports.getSubjectDetails = (req, res, next) => {
    const subId = req.params.subId;
    Subject.findById(subId)
        .populate('classId')
        .then(subject => {
            if (!subject) {
                return res.status(404).render('404', { pageTitle: 'Subject Not Found', path: '' });
            }
            res.render('subjects/subject-details', {
                sub: subject,
                pageTitle: subject.name,
                path: '/subject-details'
            });
        })                   
        .catch(err => {
            console.error(err);
            res.status(500).render('500', { pageTitle: 'Error', path: '' });
        });
};