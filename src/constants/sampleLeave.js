/**
 * WorkSphere - Sample Leave Data for Visartech
 * Provides realistic balances and historical/pending requests for all 6 employees.
 */

import { DEFAULT_ENTITLEMENTS, LEAVE_TYPES } from '../utils/leave.js';

export const generateSampleLeaveBalances = () => {
  return {
    'emp-101': {
      entitlement: { ...DEFAULT_ENTITLEMENTS },
      used: { casual: 0, sick: 0, annual: 3, personal: 0 },
    },
    'emp-102': {
      entitlement: { ...DEFAULT_ENTITLEMENTS },
      used: { casual: 1, sick: 2, annual: 0, personal: 0 },
    },
    'emp-103': {
      entitlement: { ...DEFAULT_ENTITLEMENTS },
      used: { casual: 0, sick: 1, annual: 5, personal: 0 },
    },
    'emp-104': {
      entitlement: { ...DEFAULT_ENTITLEMENTS },
      used: { casual: 2, sick: 0, annual: 0, personal: 1 },
    },
    'emp-105': {
      // David Miller is on approved sick leave today (matching attendance dataset)
      entitlement: { ...DEFAULT_ENTITLEMENTS },
      used: { casual: 0, sick: 3, annual: 0, personal: 0 },
    },
    'emp-106': {
      entitlement: { ...DEFAULT_ENTITLEMENTS },
      used: { casual: 2, sick: 0, annual: 4, personal: 0 },
    },
  };
};

export const generateSampleLeaveRequests = () => {
  return [
    // 1. Alex Turner (emp-101) - Pending future casual leave
    {
      id: 'leave-101-1',
      employeeId: 'emp-101',
      employeeName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      leaveType: LEAVE_TYPES.CASUAL,
      startDate: '2026-11-25',
      endDate: '2026-11-26',
      days: 2,
      reason: 'Attending family celebration and personal travel',
      status: 'Pending',
      appliedAt: '2026-11-17T14:30:00.000Z',
      appliedDateFormatted: 'Nov 17, 2026',
      reviewedBy: null,
      reviewedAt: null,
      hrComment: null,
    },
    // 2. Alex Turner (emp-101) - Approved annual leave in past
    {
      id: 'leave-101-2',
      employeeId: 'emp-101',
      employeeName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      leaveType: LEAVE_TYPES.ANNUAL,
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      days: 3,
      reason: 'Autumn annual vacation trip',
      status: 'Approved',
      appliedAt: '2026-10-02T10:00:00.000Z',
      appliedDateFormatted: 'Oct 02, 2026',
      reviewedBy: 'Elena Rostova (Lead HR Manager)',
      reviewedAt: '2026-10-03T11:15:00.000Z',
      hrComment: 'Approved. Project handover documented with Priya.',
    },
    // 3. Alex Turner (emp-101) - Rejected personal leave in past
    {
      id: 'leave-101-3',
      employeeId: 'emp-101',
      employeeName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      leaveType: LEAVE_TYPES.PERSONAL,
      startDate: '2026-09-18',
      endDate: '2026-09-18',
      days: 1,
      reason: 'Urgent home maintenance',
      status: 'Rejected',
      appliedAt: '2026-09-17T18:00:00.000Z',
      appliedDateFormatted: 'Sep 17, 2026',
      reviewedBy: 'Elena Rostova (Lead HR Manager)',
      reviewedAt: '2026-09-18T08:00:00.000Z',
      hrComment: 'Unable to approve due to critical sprint release milestone.',
    },
    // 4. Sarah Jenkins (emp-102) - Approved Sick Leave
    {
      id: 'leave-102-1',
      employeeId: 'emp-102',
      employeeName: 'Sarah Jenkins',
      department: 'Product Design',
      leaveType: LEAVE_TYPES.SICK,
      startDate: '2026-11-05',
      endDate: '2026-11-06',
      days: 2,
      reason: 'Viral flu and doctor recommended rest',
      status: 'Approved',
      appliedAt: '2026-11-05T07:45:00.000Z',
      appliedDateFormatted: 'Nov 05, 2026',
      reviewedBy: 'Elena Rostova (Lead HR Manager)',
      reviewedAt: '2026-11-05T08:30:00.000Z',
      hrComment: 'Get well soon. Medical certificate acknowledged.',
    },
    // 5. Michael Chen (emp-103) - Pending Annual Leave
    {
      id: 'leave-103-1',
      employeeId: 'emp-103',
      employeeName: 'Michael Chen',
      department: 'Infrastructure',
      leaveType: LEAVE_TYPES.ANNUAL,
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      days: 5,
      reason: 'Winter family vacation',
      status: 'Pending',
      appliedAt: '2026-11-16T09:20:00.000Z',
      appliedDateFormatted: 'Nov 16, 2026',
      reviewedBy: null,
      reviewedAt: null,
      hrComment: null,
    },
    // 6. Priya Sharma (emp-104) - Pending Sick Leave
    {
      id: 'leave-104-1',
      employeeId: 'emp-104',
      employeeName: 'Priya Sharma',
      department: 'Digital Solutions Lab',
      leaveType: LEAVE_TYPES.SICK,
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      days: 2,
      reason: 'Dental surgery and post-op recovery',
      status: 'Pending',
      appliedAt: '2026-11-18T08:15:00.000Z',
      appliedDateFormatted: 'Nov 18, 2026',
      reviewedBy: null,
      reviewedAt: null,
      hrComment: null,
    },
    // 7. David Miller (emp-105) - Approved Sick Leave Today
    {
      id: 'leave-105-1',
      employeeId: 'emp-105',
      employeeName: 'David Miller',
      department: 'Quality Assurance',
      leaveType: LEAVE_TYPES.SICK,
      startDate: '2026-11-18',
      endDate: '2026-11-18',
      days: 1,
      reason: 'Severe migraine - medical leave',
      status: 'Approved',
      appliedAt: '2026-11-18T07:30:00.000Z',
      appliedDateFormatted: 'Nov 18, 2026',
      reviewedBy: 'Elena Rostova (Lead HR Manager)',
      reviewedAt: '2026-11-18T08:00:00.000Z',
      hrComment: 'Approved. QA coverage assigned to Priya.',
    },
    // 8. Olivia Taylor (emp-106) - Approved Casual Leave
    {
      id: 'leave-106-1',
      employeeId: 'emp-106',
      employeeName: 'Olivia Taylor',
      department: 'Client Tech Advisory',
      leaveType: LEAVE_TYPES.CASUAL,
      startDate: '2026-11-10',
      endDate: '2026-11-11',
      days: 2,
      reason: 'Personal family engagement',
      status: 'Approved',
      appliedAt: '2026-11-08T11:00:00.000Z',
      appliedDateFormatted: 'Nov 08, 2026',
      reviewedBy: 'Elena Rostova (Lead HR Manager)',
      reviewedAt: '2026-11-08T14:20:00.000Z',
      hrComment: 'Approved by HR Operations.',
    },
    // 9. Michael Chen (emp-103) - Rejected Leave
    {
      id: 'leave-103-2',
      employeeId: 'emp-103',
      employeeName: 'Michael Chen',
      department: 'Infrastructure',
      leaveType: LEAVE_TYPES.PERSONAL,
      startDate: '2026-10-05',
      endDate: '2026-10-06',
      days: 2,
      reason: 'Relocating apartment',
      status: 'Rejected',
      appliedAt: '2026-10-04T16:00:00.000Z',
      appliedDateFormatted: 'Oct 04, 2026',
      reviewedBy: 'Elena Rostova (Lead HR Manager)',
      reviewedAt: '2026-10-05T08:10:00.000Z',
      hrComment: 'Declined due to scheduled AWS cloud migration window.',
    },
  ];
};
