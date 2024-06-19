
const Subject = require('../models/subject');

const { validationResult } = require('express-validator');

const Teacher = require('../models/teacher');

const Division = require('../models/division');

const Class = require('../models/class');

const ITEMS_PER_PAGE = 4;

exports.getIndex = (req, res, next) => {
    Class.find()
        .then(classes => {
            res.render('subjects/index', {
                path: '/subjects/index',
                pageTitle: 'Dashboard',
                user: req.user,
                classes: classes
            });

        })

}

// SUBJECT API -------------------------------------------------------------------------------------------------------------


exports.getAddSubject = (req, res, next) => {
    Class.find()
        .then(classes => {
            res.render('admin/add-subject', {
                path: '/admin/add-subject',
                pageTitle: 'Add Subject',
                user: req.user,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
                classes: classes,
                subject: {}
            });
        })
        .catch(err => console.log(err));
};

exports.postAddSubject = (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const classId = req.body.class;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Class.find()
            .then(classes => {
                res.status(422).render('admin/add-subject', {
                    path: '/admin/add-subject',
                    pageTitle: 'Add Subject',
                    user: req.user,
                    hasError: true,
                    errorMessage: 'Subject May already exist Please try Another Subject',
                    validationErrors: errors.array(),
                    classes: classes,
                    subject: { name: name, description: description, class: classId }
                });
            })
            .catch(err => console.log(err));
    }

    const subject = new Subject({
        name: name,
        description: description,
        classId: classId
    });

    subject.save()
        .then(result => {
            console.log("Subject Added ", result);
            res.redirect('/admin/subjects');
        })
        .catch(err => {
            console.log(err);
            Class.find()
                .then(classes => {
                    res.status(500).render('admin/add-subject', {
                        path: '/admin/add-subject',
                        pageTitle: 'Add Subject',
                        user: req.user,
                        hasError: true,
                        errorMessage: 'An error occurred. Please try again.',
                        validationErrors: [],
                        classes: classes,
                        subject: { name: name, description: description, class: classId }
                    });
                });
        });
};


exports.getAdminSubjects = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Subject.find()
        .countDocuments()
        .sort({ classId: -1 })
        .then(numSubjects => {
            totalItems = numSubjects;
            return Subject.find()
                .populate('classId')
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(subjects => {
            res.render('admin/subjects', {
                path: '/admin/subjects',
                pageTitle: 'Admin Subjects',
                subs: subjects,
                user: req.user,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
}


// exports.getHistory = (req, res, next) => {
//     const userClass = req.user.classId;
//     console.log('User Class:', userClass);

//     Subject.find({ classId: { $lt: userClass } })
//         .sort({ classId: -1 })
//         .populate('classId')
//         .then(subjects => {
//             console.log('History Subjects:', subjects);
//             res.render('subjects/history', {
//                 sub: subjects,
//                 pageTitle: 'History',
//                 path: '/history'
//             });

//         })
//         .catch(err => {
//             console.log(err);
//             next(err);
//         });
// };

exports.getEditSubject = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const subId = req.params.subjectId;
    console.log("get edit subject", subId);
    Subject.findById(subId)
        .then(subject => {
            if (!subject) {
                return res.redirect('/');
            }
            Class.find()
                .then(classes => {
                    res.render('admin/edit-subject', {
                        path: '/admin/edit-subject',
                        pageTitle: 'Edit Subject',
                        sub: subject,
                        subject: subject,
                        user: req.user,
                        hasError: false,
                        errorMessage: null,
                        validationErrors: [],
                        classes: classes
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditSubject = (req, res, next) => {
    const subId = req.params.subjectId;
    const updatedName = req.body.name;
    const updatedDescription = req.body.description;
    const updatedClass = req.body.class;


    console.log("Received values:", updatedName, updatedDescription, updatedClass);

    if (!updatedName || !updatedDescription || !updatedClass) {
        console.log("Missing required fields");
        return res.status(400).send('Missing required fields');
    }

    Subject.findById(subId)
        .then(subject => {
            if (!subject) {
                return res.redirect('/');
            }
            subject.name = updatedName;
            subject.description = updatedDescription;
            subject.classId = updatedClass;
            return subject.save();
        })
        .then(result => {
            console.log('UPDATED SUBJECT!', result);
            res.redirect('/admin/subjects');
        })
        .catch(err => {
            console.log("Error: ", err);
            Class.find()
                .then(classes => {
                    res.status(500).render('admin/edit-subject', {
                        path: '/admin/edit-subject',
                        pageTitle: 'Edit Subject',
                        sub: {
                            _id: subId,
                            name: updatedName,
                            description: updatedDescription,
                            classId: updatedClass,

                        },
                        user: req.user,
                        hasError: true,
                        errorMessage: err.message,
                        validationErrors: [],
                        classes: classes
                    });
                })
                .catch(fetchErr => console.log(fetchErr));
        });
};

exports.deleteSubject = (req, res, next) => {
    const subjectId = req.params.subjectId;
    Subject.findByIdAndDelete(subjectId)
        .then(result => {
            console.log('Subject deleted successfully');
            res.redirect('/admin/subjects');
        })
        .catch(err => {
            console.log(err);

            res.redirect('/admin/subjects');
        });
};


// TEACHER API ---------------------------------------------------------------------------------------------------


exports.getAddTeacher = (req, res, next) => {
    Class.find()
        .then(classes => {
            Division.find().then(divisions => {
                res.render('admin/add-teacher', {
                    path: '/admin/add-teacher',
                    pageTitle: 'Add Teacher',
                    user: req.user,
                    hasError: false,
                    errorMessage: null,
                    validationErrors: [],
                    teacher: {},
                    classes: classes,
                    divisions: divisions,
                });
            });
        })
        .catch(err => console.log(err));
};

exports.postAddTeacher = (req, res, next) => {
    const { name, email, code, number, class: classId, division: divisionId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Class.find().then(classes => {
            Division.find().then(divisions => {
                res.status(422).render('admin/add-teacher', {
                    path: '/admin/add-teacher',
                    pageTitle: 'Add Teacher',
                    user: req.user,
                    hasError: true,
                    errorMessage: errors.array().map(e => e.msg).join('. '),
                    validationErrors: errors.array(),
                    classes: classes,
                    divisions: divisions,
                    teacher: { name, email, code, number, classId, divisionId }
                });
            });
        }).catch(err => console.log(err));
    }

    const teacher = new Teacher({
        name: name,
        email: email,
        code: code,
        number: number,
        classId: classId,
        divisionId: divisionId
    });

    teacher.save()
        .then(result => {
            console.log("Teacher Added ", result);
            res.redirect('/admin/teachers');
        })
        .catch(err => {
            console.log(err);
            Class.find().then(classes => {
                Division.find().then(divisions => {
                    res.status(500).render('admin/add-teacher', {
                        path: '/admin/add-teacher',
                        pageTitle: 'Add Teacher',
                        user: req.user,
                        hasError: true,
                        errorMessage: err.message,
                        validationErrors: [],
                        classes: classes,
                        divisions: divisions,
                        teacher: { name, email, code, number, classId, divisionId }
                    });
                });
            });
        });
};

exports.getTeachers = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Teacher.find()
        .populate('classId')
        .populate('divisionId')
        .countDocuments()
        .then(numTeachers => {
            totalItems = numTeachers;
            return Teacher.find()
                .populate('classId')
                .populate('divisionId')
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(teachers => {
            res.render('admin/teachers', {
                path: '/admin/teachers',
                pageTitle: 'Admin Teachers',
                teachers: teachers,
                user: req.user,
                teacher: teachers,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
}

exports.getEditTeacher = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const teacherId = req.params.teacherId;
    console.log("get edit teacher", teacherId);
    Teacher.findById(teacherId)
        .then(teacher => {
            if (!teacher) {
                return res.redirect('/');
            }
            Class.find()
                .then(classes => {
                    Division.find().then(divisions => {
                        res.render('admin/edit-teacher', {
                            path: '/admin/edit-teacher',
                            pageTitle: 'Edit Teacher',
                            teacher: teacher,
                            user: req.user,
                            hasError: false,
                            errorMessage: null,
                            validationErrors: [],
                            classes: classes,
                            divisions: divisions
                        });
                    })

                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditTeacher = (req, res, next) => {
    const teacherId = req.params.teacherId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedCode = req.body.code;
    const updatedNumber = req.body.number;
    const updatedClass = req.body.class;
    const updatedDivision = req.body.division;


    console.log("Received values:", updatedName, updatedEmail, updatedCode, updatedNumber, updatedClass, updatedDivision);

    if (!updatedName || !updatedEmail || !updatedCode || !updatedNumber || !updatedClass || !updatedDivision) {
        console.log("Missing required fields");
        return res.status(400).send('Missing required fields');
    }

    Teacher.findById(teacherId)
        .then(teacher => {
            if (!teacher) {
                return res.redirect('/');
            }
            teacher.name = updatedName;
            teacher.email = updatedEmail;
            teacher.code = updatedCode;
            teacher.number = updatedNumber;
            teacher.class = updatedClass;
            teacher.division = updatedDivision;

            return teacher.save();

        })
        .then(result => {
            console.log('UPDATED TEACHER!', result);
            res.redirect('/admin/teachers');
        })
        .catch(err => {
            console.log("Error: ", err);
            Class.find()
                .then(classes => {
                    Division.find().then(divisions => {
                        res.status(500).render('admin/edit-teacher', {
                            path: '/admin/edit-teacher',
                            pageTitle: 'Edit Teacher',
                            divisions: divisions,
                            teacher: {
                                _id: teacherId,
                                name: updatedName,
                                email: updatedEmail,
                                code: updatedCode,
                                number: updatedNumber,
                                classId: updatedClass,
                                divisionId: updatedDivision,
                                

                            },
                            user: req.user,
                            hasError: true,
                            errorMessage: err.message,
                            validationErrors: [],
                            classes: classes


                        })

                    });
                })
                .catch(err => console.log(err));
        });
};

exports.deleteTeacher = (req, res, next) => {
    const teacherId = req.params.teacherId;
    Teacher.findByIdAndDelete(teacherId)
        .then(result => {
            console.log('Teacher deleted successfully');
            res.redirect('/admin/teachers');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/teachers');
        });
};

exports.getteacherDetails = (req, res, next) => {
    const teacherId = req.params.teacherId;
    Teacher.findById(teacherId)
        .then(teacher => {
            if (!teacher) {
                return res.redirect('/admin/teachers');
            }
            Class.find().then(classes => {
                Division.find().then(divisions => {
                    res.render('admin/teacher-details', {
                        path: '/admin/teacher-details',
                        pageTitle: 'Teacher Details',
                        teacher: teacher,
                        classes: classes,
                        divisions: divisions
                    });

                })

            })

        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};


// CLASS API --------------------------------------------------------------------------------------------------------------------------


exports.getAddClass = (req, res, next) => {
    res.render('admin/add-class', {
        path: '/admin/add-class',
        pageTitle: 'Add Class',
        user: req.user,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddClass = (req, res, next) => {
    const number = req.body.number;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-class', {
            path: '/admin/add-class',
            pageTitle: 'Add Class',
            user: req.user,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const newClass = new Class({ number: number });

    newClass.save()
        .then(result => {
            console.log("Class Added ", result);
            res.redirect('/admin/classes');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/classes');
        });
};

exports.getClasses = (req, res, next) => {
    Class.find()
        .then(classes => {
            res.render('admin/classes', {
                path: '/admin/classes',
                pageTitle: 'Classes',
                user: req.user,
                classes: classes
            });
        })
        .catch(err => console.log(err));
};

exports.getEditClass = (req, res, next) => {
    const classId = req.params.classId;
    Class.findById(classId)
        .then(classDoc => {
            if (!classDoc) {
                return res.redirect('/admin/classes');
            }
            res.render('admin/edit-class', {
                path: '/admin/edit-class',
                pageTitle: 'Edit Class',
                user: req.user,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
                class: classDoc
            });
        })
        .catch(err => console.log(err));
};

exports.postEditClass = (req, res, next) => {
    const classId = req.params.classId;
    const updatedNumber = req.body.number;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-class', {
            path: '/admin/edit-class',
            pageTitle: 'Edit Class',
            user: req.user,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            class: { _id: classId, number: updatedNumber }
        });
    }

    Class.findById(classId)
        .then(classDoc => {
            if (!classDoc) {
                return res.redirect('/admin/classes');
            }
            classDoc.number = updatedNumber;
            return classDoc.save();
        })
        .then(result => {
            console.log("Class Updated ", result);
            res.redirect('/admin/classes');
        })
        .catch(err => console.log(err));
};

exports.deleteClass = (req, res, next) => {
    const classId = req.params.classId;
    Class.findByIdAndRemove(classId)
        .then(() => {
            console.log("Class Deleted");
            res.redirect('/admin/classes');
        })
        .catch(err => console.log(err));
};

exports.getClasses = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Class.find()
        .countDocuments()
        .then(numClasses => {
            totalItems = numClasses;
            return Class.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(classes => {
            res.render('admin/classes', {
                path: '/admin/classes',
                pageTitle: 'Admin Classes',
                classes: classes,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.getEditClass = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const classId = req.params.classId;
    Class.findById(classId)
       
        .then(classs => {
            if (!classs) {
                return res.redirect('/');
            }
            res.render('admin/edit-class', {
                path: '/admin/edit-class',
                pageTitle: 'Edit Class',
                editing: editMode,
                classs: classs,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.getClassDetails = (req, res, next) => {
    const classId = req.params.classId;
    Class.findById(classId)
        .then(classs => {
            if (!classs) {
                return res.redirect('/');
            }
            res.render('admin/class-details', {
                path: '/admin/class-',
                pageTitle: 'Class Details',
                class: classs
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.postEditClass = (req, res, next) => {
    const classId = req.params.classId;
    const updatedNumber = req.body.number;

    Class.findById(classId)
        .then(classs => {
            if (!classs) {
                console.log('Class not found');
                return res.redirect('/');
            }
            classs.number = updatedNumber;
            return classs.save();
        })
        .then(result => {
            console.log('UPDATED CLASS!', result);
            res.redirect('/admin/classes');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/classes');
        });
};

exports.deleteClass = (req, res, next) => {
    const classId = req.params.classId;
    Class.findByIdAndDelete(classId)
        .then(result => {
            console.log('Class deleted successfully');
            res.redirect('/admin/classes');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/classes');
        });
};
exports.getClassDetails = (req, res, next) => {
    const classId = req.params.classId;

    Class.findById(classId)
        .then(classs => {
            if (!classs) {
                return res.redirect('/admin/classes');
            }
            
            return Promise.all([
                Teacher.find({ classId: classId }),
                Division.find({ classId: classId }),
                Subject.find({ classId: classId })
            ]).
                then(([teachers, divisions, subjects]) => {
                console.log('Teachers:', teachers);
                console.log('Divisions:', divisions);
                console.log('Subjects:', subjects);

                res.render('admin/class-details', {
                    path: '/admin/class-details',
                    pageTitle: 'Class Details',
                    classs: classs,
                    teachers: teachers,
                    divisions: divisions,
                    subjects: subjects
                });
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};



// DIVISION API ------------------------------------------------------------------------------------------------------------------------


exports.getAddDivision = (req, res, next) => {
    Class.find()
        .then(classes => {
            res.render('admin/add-division', {
                path: '/admin/add-division',
                pageTitle: 'Add Division',
                user: req.user,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
                classes: classes
            });
        })
        .catch(err => console.log(err));
};

exports.postAddDivision = (req, res, next) => {
    const name = req.body.name;
    const classId = req.body.class;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        Class.find()
            .then(classes => {
                return res.status(422).render('admin/add-division', {
                    path: '/admin/add-division',
                    pageTitle: 'Add Division',
                    user: req.user,
                    hasError: true,
                    errorMessage: errors.array()[0].msg,
                    validationErrors: errors.array(),
                    classes: classes,
                    name: name,
                    classId: classId
                });
            })
            .catch(err => console.log(err));
    } else {
        const division = new Division({
            name: name,
            classId: classId
        });

        division.save()
            .then(result => {
                console.log("Division Added ", result);
                res.redirect('/admin/divisions');
            })
            .catch(err => {
                console.log(err);
                res.redirect('/admin/divisions');
            });
    }
};

exports.getDivisions = (req, res, next) => {

    Division.find()
        .populate('classId')
        .then(divisions => {
            res.render('admin/divisions', {
                path: '/admin/divisions',
                pageTitle: 'Admin Divisions',
                divisions: divisions
            });
        })
        .catch(err => console.log(err));
};

exports.getEditDivision = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const divisionId = req.params.divisionId;
    let classes;
    Class.find()
        .then(foundClasses => {
            classes = foundClasses;
            return Division.findById(divisionId);
        })
        .then(division => {
            if (!division) {
                return res.redirect('/');
            }
            res.render('admin/edit-division', {
                pageTitle: 'Edit Division',
                path: '/admin/edit-division',
                editing: editMode,
                division: division,
                classes: classes,
                errorMessage: null,
                validationErrors: [],
                classes: classes
            });
        })
        .catch(err => console.log(err));
};
exports.postEditDivision = (req, res, next) => {
    const divisionId = req.params.divisionId;
    const updatedName = req.body.name;
    const updatedClass = req.body.class;

    console.log("Received values:", updatedName, updatedClass);

    if (!updatedName || !updatedClass) {
        console.log("Missing required fields");
        return res.status(400).send('Missing required fields');
    }

    Division.findById(divisionId)
        .then(division => {
            if (!division) {
                return res.redirect('/');
            }
            division.name = updatedName;
            division.classId = updatedClass;

            return division.save();

        })
        .then(result => {
            console.log('UPDATED DIVISION!', result);
            res.redirect('/admin/divisions');
        })
        .catch(err => {
            console.log("Error: ", err);
            Class.find()
                .then(classes => {
                    res.status(500).render('admin/edit-division', {
                        path: '/admin/edit-division',
                        pageTitle: 'Edit Division',
                    division: {
                            _id: divisionId,
                            name: updatedName,
                            classId: updatedClass,

                        },
                        user: req.user,
                        hasError: true,
                        errorMessage: err.message,
                        validationErrors: [],
                        classes: classes
                    });
                })
                .catch(err => console.log(err));
        });
};


exports.deleteDivision = (req, res, next) => {
    const divisionId = req.params.divisionId;
    Division.findByIdAndDelete(divisionId)
        .then(result => {
            console.log('Division deleted successfully');
            res.redirect('/admin/divisions');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/divisions');
        });
};

exports.getDivisionDetails = (req, res, next) => {
    const divisionId = req.params.divisionId;
    Division.findById(divisionId)
        .populate('classId')
        .then(division => {
            if (!division) {
                return res.redirect('/admin/divisions');
            }
            res.render('admin/division-details', {
                path: '/admin/division-details',
                pageTitle: 'Division Details',
                division: division
            });
        })
        .catch(err => console.log(err));
};