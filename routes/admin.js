const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const Class = require('../models/class');
const User = require('../models/user');
const Subject = require('../models/subject');
const Division = require('../models/division');
const Teacher = require('../models/teacher');

const { body } = require('express-validator');

router.get('/', adminController.getIndex);

//SUBJECT ROUTES -------------------------------------------------------------------------------

router.get('/admin/add-subject', isAuth, adminController.getAddSubject);
router.post('/admin/add-subject', [
    body('name')
        .isString()
        .isLength({ min: 3, max: 15 })
        .trim()
        .custom((value, { req }) => {
            return Subject.findOne({ name: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject(
                        'This Subject Is Already Added. Please Try Another One.!'
                    );
                }
            });

        }),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
        .withMessage('Please enter a valid description (between 5 and 400 characters).'),
], isAuth, adminController.postAddSubject);

router.get('/admin/edit-subject/:subjectId', isAuth, adminController.getEditSubject);

router.post('/admin/edit-subject/:subjectId', [
    body('name')
        .isString()
        .isLength({ min: 3 })
        .trim()
        .withMessage('Please enter a valid name (at least 3 characters).'),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
        .withMessage('Please enter a valid description (between 5 and 400 characters).'),
    body('class')
        .isNumeric()
        .trim()
        .withMessage('Please Choose a valid class.'),
    body('division')
        .isString()
        .trim()
        .withMessage('Please Choose  a valid division.')
], isAuth, adminController.postEditSubject);

router.get('/admin/subjects', isAuth, adminController.getAdminSubjects);

// router.get('/subjects/history', isAuth, adminController.getHistory);


router.post('/admin/delete-subject/:subjectId', adminController.deleteSubject);


// TEACHER ROUTES -----------------------------------------------------------------------------------------

router.get('/admin/add-teacher', isAuth, adminController.getAddTeacher);

router.post('/admin/add-teacher', [
    body('name')
        .isString()
        .withMessage('Please Enter a Valid Name! '),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return Teacher.findOne({ email: value }).then(TeacherDoc => {
                if (TeacherDoc) {
                    return Promise.reject(
                        'E-Mail address already exists!'
                    )
                }
            })
        }),
    body('number')
        .isString({ min: 6, max: 10 })
        .trim()
        .withMessage('Please Enter Valid Number')
        .custom((value, { req }) => {
            return User.findOne({ number: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject(
                        'Number already exists!'
                    )
                }
            })
        })

], isAuth, adminController.postAddTeacher);

router.get('/admin/teachers', isAuth, adminController.getTeachers);

router.get('/admin/edit-teacher/:teacherId', isAuth, adminController.getEditTeacher);

router.post('/admin/edit-teacher/:teacherId', [
    body('name')
        .isString()
        .withMessage('Please Enter a Valid Name! ')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
], isAuth, adminController.postEditTeacher);

router.get("/admin/teachers/:teacherId", isAuth, adminController.getteacherDetails);

router.post('/admin/delete-teacher/:teacherId', isAuth, adminController.deleteTeacher);


// CLASS ROUTES -------------------------------------------------------------------------------------------

router.get('/admin/add-class', isAuth, adminController.getAddClass);

router.post('/admin/add-class', [
    body('number')
        .isInt({ min: 1, max: 12 })
        .withMessage('Please enter a valid class number between 1 and 12.')
        .trim()
        .custom((value, { req }) => {
            return Class.findOne({ number: value }).then(classDoc => {
                if (classDoc) {
                    return Promise.reject('Class Number already exists!');
                }
            });
        })
], isAuth, adminController.postAddClass);

router.get('/admin/classes', isAuth, adminController.getClasses);

router.get('/admin/classes/:classId', isAuth, adminController.getClassDetails);

router.get('/admin/edit-class/:classId', isAuth, adminController.getEditClass);

router.post('/admin/edit-class/:classId', [
    body('number')
        .isInt({ min: 1, max: 12 })
        .withMessage('Please enter a valid class number between 1 and 12.')
        .trim()
], isAuth, adminController.postEditClass);

router.post('/admin/delete-class/:classId', isAuth, adminController.deleteClass);



// DIVISION ROUTES ----------------------------------------------------------------------------------------


router.get('/admin/add-division', isAuth, adminController.getAddDivision);

router.post('/admin/add-division', [
    body('class')
        .not()
        .isEmpty()
        .withMessage('Please select a valid class.')
        .isMongoId()
        .withMessage('Invalid class ID format.'),
    body('name')
        .matches(/^[A-Z]{1}$/)
        .withMessage('Invalid Division Name! must contain only a single uppercase character.')
        .custom((value, { req }) => {
            return Division.findOne({ name: value, classId: req.body.class }).then(subDoc => {
                if (subDoc) {
                    return Promise.reject(
                        'This Division Is Already Added. Please Try Another One.!'
                    );
                }
            });
        })
], isAuth, adminController.postAddDivision);

router.get('/admin/divisions', isAuth, adminController.getDivisions);

router.get('/admin/edit-division/:divisionId', isAuth, adminController.getEditDivision);

router.post('/admin/edit-division/:divisionId', [
    body('name')
        .isString()
        .isLength({ min: 1 })
        .trim()
        .withMessage('Please enter a valid division name.'),
    body('class')
        .isMongoId()
        .withMessage('Please select a valid class.')
], isAuth, adminController.postEditDivision);

router.post('/admin/delete-division/:divisionId', isAuth, adminController.deleteDivision);

router.get('/admin/division/:divisionId', isAuth, adminController.getDivisionDetails);


module.exports = router;