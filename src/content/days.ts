import { validateContent } from './validation';
import dependencies from './dependencies.json';
import timetable from './timetables.json';
import type { DayDefinition } from '../types';

export const days: DayDefinition[] = [
  { day: 1, weekday: 'MON', titleKey: 'days.1.title', introKey: 'days.1.intro', tasks: [
    { id: 'message_welcome', day: 1, kind: 'message', titleKey: 'tasks.messageWelcome.title', descriptionKey: 'tasks.messageWelcome.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.messageRead' }] },
    { id: 'notice_basic', day: 1, kind: 'document', titleKey: 'tasks.noticeBasic.title', descriptionKey: 'tasks.noticeBasic.desc', required: true, variants: [], choices: [{ labelKey: 'actions.stamp', outcome: 'completed', feedbackKey: 'feedback.noticeOk' }] },
    { id: 'class_first', day: 1, kind: 'class', titleKey: 'tasks.classFirst.title', descriptionKey: 'tasks.classFirst.desc', required: true, variants: [], choices: [
      { labelKey: 'actions.example', outcome: 'completed', feedbackKey: 'feedback.classExample' }, { labelKey: 'actions.textbook', outcome: 'completed', feedbackKey: 'feedback.classTextbook' }
    ] },
  ]},
  { day: 2, weekday: 'TUE', titleKey: 'days.2.title', introKey: 'days.2.intro', tasks: [
    { id: 'notice_variant', day: 2, kind: 'document', titleKey: 'tasks.noticeVariant.title', descriptionKey: 'tasks.noticeVariant.desc', required: true, variants: ['missing_signature'], choices: [
      { labelKey: 'actions.requestFix', outcome: 'resolved_with_issue', feedbackKey: 'feedback.requestedFix' }, { labelKey: 'actions.stamp', outcome: 'resolved_with_issue', feedbackKey: 'feedback.missedSignature' }
    ] },
    { id: 'class_question', day: 2, kind: 'class', titleKey: 'tasks.classQuestion.title', descriptionKey: 'tasks.classQuestion.desc', required: true, variants: [], choices: [{ labelKey: 'actions.practice', outcome: 'completed', feedbackKey: 'feedback.classPractice' }] },
    { id: 'grading_basic', day: 2, kind: 'grading', titleKey: 'tasks.gradingBasic.title', descriptionKey: 'tasks.gradingBasic.desc', required: true, variants: [], choices: [{ labelKey: 'actions.score', outcome: 'completed', feedbackKey: 'feedback.graded' }, { labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.partialCorrect' }] },
  ]},
  { day: 3, weekday: 'WED', titleKey: 'days.3.title', introKey: 'days.3.intro', tasks: [
    { id: 'message_request', day: 3, kind: 'message', titleKey: 'tasks.messageRequest.title', descriptionKey: 'tasks.messageRequest.desc', required: true, variants: [], choices: [{ labelKey: 'actions.accept', outcome: 'completed', feedbackKey: 'feedback.accepted' }] },
    { id: 'grading_partial', day: 3, kind: 'grading', titleKey: 'tasks.gradingPartial.title', descriptionKey: 'tasks.gradingPartial.desc', required: true, variants: ['partial_credit'], choices: [
      { labelKey: 'actions.partial', outcome: 'completed', feedbackKey: 'feedback.partialCorrect' }, { labelKey: 'actions.zero', outcome: 'resolved_with_issue', feedbackKey: 'feedback.partialMissed' }
    ] },
    { id: 'class_followup', day: 3, kind: 'class', titleKey: 'tasks.classFollowup.title', descriptionKey: 'tasks.classFollowup.desc', required: true, variants: [], choices: [{ labelKey: 'actions.example', outcome: 'completed', feedbackKey: 'feedback.classExample' }] },
  ]},
  { day: 4, weekday: 'THU', titleKey: 'days.4.title', introKey: 'days.4.intro', tasks: [
    { id: 'message_broadcast', day: 4, kind: 'message', titleKey: 'tasks.messageBroadcast.title', descriptionKey: 'tasks.messageBroadcast.desc', required: true, variants: [], choices: [{ labelKey: 'actions.accept', outcome: 'completed', feedbackKey: 'feedback.broadcastAccepted' }] },
    { id: 'class_broadcast_day', day: 4, kind: 'class', titleKey: 'tasks.classBroadcastDay.title', descriptionKey: 'tasks.classBroadcastDay.desc', required: true, variants: [], choices: [{ labelKey: 'actions.practice', outcome: 'completed', feedbackKey: 'feedback.classPractice' }] },
    { id: 'equipment_check', day: 4, kind: 'equipment', titleKey: 'tasks.equipmentCheck.title', descriptionKey: 'tasks.equipmentCheck.desc', required: true, variants: ['loose_cable'], choices: [{ labelKey: 'actions.inspect', outcome: 'completed', feedbackKey: 'feedback.equipmentFound' }] },
  ]},
  { day: 5, weekday: 'FRI', titleKey: 'days.5.title', introKey: 'days.5.intro', tasks: [
    { id: 'message_admin', day: 5, kind: 'message', titleKey: 'tasks.messageAdmin.title', descriptionKey: 'tasks.messageAdmin.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.adminReply' }] },
    { id: 'cable_repair', day: 5, kind: 'equipment', titleKey: 'tasks.cableRepair.title', descriptionKey: 'tasks.cableRepair.desc', required: true, variants: ['signal_chain'], choices: [{ labelKey: 'actions.repair', outcome: 'completed', feedbackKey: 'feedback.repaired' }] },
    { id: 'edugreat_purchase', day: 5, kind: 'approval', titleKey: 'tasks.edugreatPurchase.title', descriptionKey: 'tasks.edugreatPurchase.desc', required: true, variants: ['budget_code'], choices: [{ labelKey: 'actions.submit', outcome: 'completed', feedbackKey: 'feedback.submitted' }] },
  ]},
  { day: 6, weekday: 'MON', titleKey: 'days.6.title', introKey: 'days.6.intro', tasks: [
    { id: 'message_homeroom', day: 6, kind: 'message', titleKey: 'tasks.messageHomeroom.title', descriptionKey: 'tasks.messageHomeroom.desc', required: true, variants: [], choices: [{ labelKey: 'actions.accept', outcome: 'completed', feedbackKey: 'feedback.homeroomAccepted' }] },
    { id: 'attendance_basic', day: 6, kind: 'attendance', titleKey: 'tasks.attendanceBasic.title', descriptionKey: 'tasks.attendanceBasic.desc', required: true, variants: [], choices: [{ labelKey: 'actions.saveAttendance', outcome: 'completed', feedbackKey: 'feedback.attendanceSaved' }] },
    { id: 'class_homeroom', day: 6, kind: 'class', titleKey: 'tasks.classHomeroom.title', descriptionKey: 'tasks.classHomeroom.desc', required: true, variants: [], choices: [{ labelKey: 'actions.example', outcome: 'completed', feedbackKey: 'feedback.classExample' }] },
  ]},
  { day: 7, weekday: 'TUE', titleKey: 'days.7.title', introKey: 'days.7.intro', tasks: [
    { id: 'phone_guardian', day: 7, kind: 'document', titleKey: 'newTasks.phoneTitle', descriptionKey: 'newTasks.phoneDesc', required: true, variants: [], choices: [{ labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.attendancePending' }] },
    { id: 'message_approval_return', day: 7, kind: 'message', titleKey: 'tasks.messageApprovalReturn.title', descriptionKey: 'tasks.messageApprovalReturn.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.approvalReturned' }] },
    { id: 'attendance_unknown', day: 7, kind: 'attendance', titleKey: 'tasks.attendanceUnknown.title', descriptionKey: 'tasks.attendanceUnknown.desc', required: true, variants: ['unknown_reason'], choices: [{ labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.attendancePending' }] },
    { id: 'approval_revision', day: 7, kind: 'approval', titleKey: 'tasks.approvalRevision.title', descriptionKey: 'tasks.approvalRevision.desc', required: true, variants: ['missing_comparison'], choices: [{ labelKey: 'actions.revise', outcome: 'completed', feedbackKey: 'feedback.approvalResubmitted' }] },
  ]},
  { day: 8, weekday: 'WED', titleKey: 'days.8.title', introKey: 'days.8.intro', tasks: [
    { id: 'attendance_followup', day: 8, kind: 'attendance', titleKey: 'tasks.attendanceFollowup.title', descriptionKey: 'tasks.attendanceFollowup.desc', required: true, variants: ['reason_confirmed'], choices: [{ labelKey: 'actions.saveAttendance', outcome: 'completed', feedbackKey: 'feedback.attendanceConfirmed' }] },
    { id: 'student_counseling', day: 8, kind: 'counseling', titleKey: 'tasks.studentCounseling.title', descriptionKey: 'tasks.studentCounseling.desc', required: true, variants: ['broadcast_student'], choices: [{ labelKey: 'actions.listen', outcome: 'completed', feedbackKey: 'feedback.counselingListened' }, { labelKey: 'actions.advise', outcome: 'resolved_with_issue', feedbackKey: 'feedback.counselingAdvised' }] },
    { id: 'class_counseling_day', day: 8, kind: 'class', titleKey: 'tasks.classCounselingDay.title', descriptionKey: 'tasks.classCounselingDay.desc', required: true, variants: [], choices: [{ labelKey: 'actions.practice', outcome: 'completed', feedbackKey: 'feedback.classPractice' }] },
  ]},
  { day: 9, weekday: 'THU', titleKey: 'days.9.title', introKey: 'days.9.intro', tasks: [
    { id: 'message_approval_done', day: 9, kind: 'message', titleKey: 'tasks.messageApprovalDone.title', descriptionKey: 'tasks.messageApprovalDone.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.approvalDone' }] },
    { id: 'official_document', day: 9, kind: 'document', titleKey: 'newTasks.documentTitle', descriptionKey: 'newTasks.documentDesc', required: true, variants: [], choices: [{ labelKey: 'actions.submit', outcome: 'completed', feedbackKey: 'feedback.submitted' }] },
    { id: 'grading_review', day: 9, kind: 'grading', titleKey: 'tasks.gradingReview.title', descriptionKey: 'tasks.gradingReview.desc', required: true, variants: ['previous_error'], choices: [{ labelKey: 'actions.score', outcome: 'completed', feedbackKey: 'feedback.graded' }, { labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.partialCorrect' }] },
    { id: 'class_admin_day', day: 9, kind: 'class', titleKey: 'tasks.classAdminDay.title', descriptionKey: 'tasks.classAdminDay.desc', required: true, variants: [], choices: [{ labelKey: 'actions.example', outcome: 'completed', feedbackKey: 'feedback.classExample' }] },
  ]},
  { day: 10, weekday: 'FRI', titleKey: 'days.10.title', introKey: 'days.10.intro', tasks: [
    { id: 'message_exam_schedule', day: 10, kind: 'message', titleKey: 'tasks.messageExamSchedule.title', descriptionKey: 'tasks.messageExamSchedule.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.examScheduleRead' }] },
    { id: 'exam_pack', day: 10, kind: 'exam', titleKey: 'tasks.examPack.title', descriptionKey: 'tasks.examPack.desc', required: true, variants: ['required_materials'], choices: [{ labelKey: 'actions.seal', outcome: 'completed', feedbackKey: 'feedback.examPacked' }] },
    { id: 'check_supervision', day: 10, kind: 'document', titleKey: 'tasks.checkSupervision.title', descriptionKey: 'tasks.checkSupervision.desc', required: true, variants: [], choices: [{ labelKey: 'actions.confirmSchedule', outcome: 'completed', feedbackKey: 'feedback.supervisionChecked' }] },
  ]},
  { day: 11, weekday: 'MON', titleKey: 'days.11.title', introKey: 'days.11.intro', tasks: [
    { id: 'exam_count_day11', day: 11, kind: 'exam', titleKey: 'tasks.examCount11.title', descriptionKey: 'tasks.examCount11.desc', required: true, variants: [], choices: [{ labelKey: 'actions.count', outcome: 'completed', feedbackKey: 'feedback.examCounted' }] },
    { id: 'supervise_day11', day: 11, kind: 'exam', titleKey: 'tasks.supervise11.title', descriptionKey: 'tasks.supervise11.desc', required: true, variants: [], choices: [{ labelKey: 'actions.followGuide', outcome: 'completed', feedbackKey: 'feedback.supervised' }] },
    { id: 'omr_basic', day: 11, kind: 'exam', titleKey: 'tasks.omrBasic.title', descriptionKey: 'tasks.omrBasic.desc', required: true, variants: [], choices: [{ labelKey: 'actions.finishOmr', outcome: 'completed', feedbackKey: 'feedback.omrBasicDone' }] },
  ]},
  { day: 12, weekday: 'TUE', titleKey: 'days.12.title', introKey: 'days.12.intro', tasks: [
    { id: 'message_room_change', day: 12, kind: 'message', titleKey: 'tasks.messageRoomChange.title', descriptionKey: 'tasks.messageRoomChange.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.roomChanged' }] },
    { id: 'supervise_question', day: 12, kind: 'exam', titleKey: 'tasks.superviseQuestion.title', descriptionKey: 'tasks.superviseQuestion.desc', required: true, variants: ['student_question'], choices: [{ labelKey: 'actions.checkGuide', outcome: 'completed', feedbackKey: 'feedback.questionHandled' }, { labelKey: 'actions.guessAnswer', outcome: 'resolved_with_issue', feedbackKey: 'feedback.questionEscalated' }] },
    { id: 'omr_day12', day: 12, kind: 'exam', titleKey: 'tasks.omrDay12.title', descriptionKey: 'tasks.omrDay12.desc', required: true, variants: ['name_check'], choices: [{ labelKey: 'actions.finishOmr', outcome: 'completed', feedbackKey: 'feedback.omrBasicDone' }, { labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.omrPending' }] },
  ]},
  { day: 13, weekday: 'WED', titleKey: 'days.13.title', introKey: 'days.13.intro', tasks: [
    { id: 'supervise_day13', day: 13, kind: 'exam', titleKey: 'tasks.supervise13.title', descriptionKey: 'tasks.supervise13.desc', required: true, variants: ['final_day'], choices: [{ labelKey: 'actions.followGuide', outcome: 'completed', feedbackKey: 'feedback.supervised' }] },
    { id: 'omr_missing', day: 13, kind: 'exam', titleKey: 'tasks.omrMissing.title', descriptionKey: 'tasks.omrMissing.desc', required: true, variants: ['missing_student_id'], choices: [{ labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.omrPending' }] },
    { id: 'exam_material_sort', day: 13, kind: 'document', titleKey: 'tasks.examMaterialSort.title', descriptionKey: 'tasks.examMaterialSort.desc', required: true, variants: [], choices: [{ labelKey: 'actions.sort', outcome: 'completed', feedbackKey: 'feedback.examSorted' }] },
  ]},
  { day: 14, weekday: 'THU', titleKey: 'days.14.title', introKey: 'days.14.intro', tasks: [
    { id: 'grading_post_exam', day: 14, kind: 'grading', titleKey: 'tasks.gradingPostExam.title', descriptionKey: 'tasks.gradingPostExam.desc', required: true, variants: ['partial_credit', 'previous_error'], choices: [{ labelKey: 'actions.score', outcome: 'completed', feedbackKey: 'feedback.finalGrading' }, { labelKey: 'actions.pending', outcome: 'resolved_with_issue', feedbackKey: 'feedback.partialCorrect' }] },
    { id: 'counseling_followup', day: 14, kind: 'counseling', titleKey: 'tasks.counselingFollowup.title', descriptionKey: 'tasks.counselingFollowup.desc', required: true, variants: ['previous_choice'], choices: [{ labelKey: 'actions.listen', outcome: 'completed', feedbackKey: 'feedback.counselingFollowup' }] },
    { id: 'message_budget_close', day: 14, kind: 'message', titleKey: 'tasks.messageBudgetClose.title', descriptionKey: 'tasks.messageBudgetClose.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.budgetClosed' }] },
  ]},
  { day: 15, weekday: 'FRI', titleKey: 'days.15.title', introKey: 'days.15.intro', tasks: [
    { id: 'attendance_final', day: 15, kind: 'attendance', titleKey: 'tasks.attendanceFinal.title', descriptionKey: 'tasks.attendanceFinal.desc', required: true, variants: [], choices: [{ labelKey: 'actions.saveAttendance', outcome: 'completed', feedbackKey: 'feedback.attendanceFinal' }] },
    { id: 'class_final', day: 15, kind: 'class', titleKey: 'tasks.classFinal.title', descriptionKey: 'tasks.classFinal.desc', required: true, variants: ['story_callback'], choices: [{ labelKey: 'actions.practice', outcome: 'completed', feedbackKey: 'feedback.classFinal' }] },
    { id: 'message_final', day: 15, kind: 'message', titleKey: 'tasks.messageFinal.title', descriptionKey: 'tasks.messageFinal.desc', required: true, variants: [], choices: [{ labelKey: 'actions.read', outcome: 'completed', feedbackKey: 'feedback.finalMessage' }] },
  ]},
];

export { contentSchema } from './validation';
validateContent(days, dependencies, timetable);
