const Course = require('../model/Course');
const QuizAttempt = require('../model/QuizAttempt');
const Submission = require('../model/Submission');
const Certificate = require('../model/Certificate');
const User = require('../model/User');
const Enrollment = require('../model/Enrollment');
const { generateCertificatePdf } = require('../utils/certificateGenerator');

/**
 * Evaluates course completion and generates certificate if eligible
 * @param {String} studentId 
 * @param {String} courseId 
 */
const evaluateCourseCompletion = async (studentId, courseId) => {
    try {
        console.log(`[EvaluationEngine] Starting evaluation for student: ${studentId}, course: ${courseId}`);
        
        // 1. Identity Context Isolation & Gate 1: Progress Check
        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (!enrollment || enrollment.progressPercentage !== 100) {
            console.log(`[EvaluationEngine] Aborting: Student has not reached 100% progress. Progress: ${enrollment?.progressPercentage || 0}%`);
            return false;
        }

        // 2. Gate 0: Immediate Duplicate Check (Prevents Race Conditions)
        const existingCert = await Certificate.findOne({ studentId, courseId });
        if (existingCert) {
            console.log(`[EvaluationEngine] Certificate already exists for this student and course.`);
            return existingCert;
        }

        // 2. Gate 2: Pending Assignments Check
        const pendingSubmissions = await Submission.countDocuments({ 
            studentId, 
            courseId, 
            status: 'submitted' 
        });

        // If there are ungraded assignments, gracefully abort generation.
        if (pendingSubmissions > 0) {
            console.log(`[EvaluationEngine] Aborting: ${pendingSubmissions} ungraded assignments found.`);
            return { success: false, message: "Pending educator review." };
        }

        // 1. Fetch Course and Configuration
        const course = await Course.findById(courseId).populate('educatorId', 'name');
        if (!course) {
            console.error(`[EvaluationEngine] Course ${courseId} not found`);
            return false;
        }

        const config = course.gradingConfiguration;
        if (!config || !config.isCertificationEnabled) {
            console.log(`[EvaluationEngine] Certification not enabled for course: ${courseId}`);
            return false;
        }

        // 2. Fetch QuizAttempts and Submissions
        const [quizAttempts, submissions] = await Promise.all([
            QuizAttempt.find({ studentId, courseId, status: 'completed' }),
            Submission.find({ studentId, courseId, status: 'graded' }).populate('assignmentId', 'totalMarks')
        ]);

        // 3. Math - Quizzes
        let totalQuizScore = 0;
        let totalQuizMarksPossible = 0;
        quizAttempts.forEach(attempt => {
            totalQuizScore += (attempt.score || 0);
            totalQuizMarksPossible += (attempt.totalMarksPossible || 0);
        });

        const quizPercentage = totalQuizMarksPossible > 0 ? (totalQuizScore / totalQuizMarksPossible) * 100 : 100;

        // 4. Math - Assignments
        let totalAssignmentMarks = 0;
        let totalAssignmentMaxMarks = 0;
        submissions.forEach(sub => {
            totalAssignmentMarks += (sub.marksObtained || 0);
            totalAssignmentMaxMarks += (sub.assignmentId?.totalMarks || 0);
        });

        const assignmentPercentage = totalAssignmentMaxMarks > 0 ? (totalAssignmentMarks / totalAssignmentMaxMarks) * 100 : 100;

        // 5. Final Score Calculation
        const finalScore = (quizPercentage * (config.quizWeight / 100)) + (assignmentPercentage * (config.assignmentWeight / 100));
        const finalPercentage = Math.round(finalScore * 100) / 100;

        console.log(`[EvaluationEngine] Final Score: ${finalPercentage}% (Quizzes: ${quizPercentage}%, Assignments: ${assignmentPercentage}%)`);

        // 6. Eligibility Check
        if (finalPercentage < config.minGradeToPass) {
            console.log(`[EvaluationEngine] Student failed to reach minimum grade (${config.minGradeToPass}%). Score: ${finalPercentage}%`);
            return false;
        }

        // 7. Mapping Grade Label
        let gradeLabel = "Passed";
        if (config.gradingScale && config.gradingScale.length > 0) {
            // Grading scale is usually sorted descending
            const sortedScale = [...config.gradingScale].sort((a, b) => b.minScore - a.minScore);
            const match = sortedScale.find(grade => finalPercentage >= grade.minScore);
            if (match) {
                gradeLabel = match.label;
            }
        }


        // 9. Fetch Student details for certificate
        const student = await User.findById(studentId);
        if (!student) return false;

        // 10. Generate Certificate PDF
        const certId = `CERT-${Date.now()}-${studentId.toString().slice(-6)}`.toUpperCase();
        
        const pdfUrl = await generateCertificatePdf({
            studentName: student.name,
            courseName: course.title,
            grade: gradeLabel,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            certId: certId,
            educatorName: course.educatorId?.name || "ByteLearn Instructor"
        });

        if (!pdfUrl) {
            console.error(`[EvaluationEngine] Failed to generate PDF URL`);
            return false;
        }

        // 11. Save Certificate
        const certificate = await Certificate.create({
            studentId,
            courseId,
            educatorId: course.educatorId._id,
            certificateId: certId,
            finalPercentage,
            gradeLabel,
            pdfUrl,
            issuedAt: Date.now()
        });

        console.log(`[EvaluationEngine] Certificate generated successfully: ${certId}`);
        return certificate;

    } catch (error) {
        console.error(`[EvaluationEngine] Error:`, error);
        return false;
    }
};

module.exports = { evaluateCourseCompletion };
