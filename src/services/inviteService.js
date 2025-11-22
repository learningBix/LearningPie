// inviteService.js
import { apiCall } from './apiService';

export const inviteAPI = {
  // Send invite link via email
  sendInviteLink: async (studentName, emails, link) => {
    const res = await apiCall('/send_invite_link', {
      student_name: studentName,
      emails, // comma-separated string or array
      link,
    });

    const ok = res && (res.success === true || res.replyCode === 'success');
    return {
      ...res,
      success: ok,
    };
  },

  // Fetch referral list
  getReferralList: async (referralCode) => {
    const res = await apiCall('/web_user_refferal_list', {
      refferal_code: referralCode,
    });

    const ok = res && (res.success === true || res.replyCode === 'success');
    if (ok && Array.isArray(res.data)) {
      // Parse and categorize referrals
      const pending = [];
      const purchased = [];
      let totalEarnings = 0;

      res.data.forEach((user) => {
        const mapped = {
          id: user.id,
          name: user.name || user.user_name || 'Unknown',
          email: user.email,
          status: user.status || '0',
          created: user.created,
          course_name: user.course_name || '-',
          earnings: user.earnings || 0,
          subscription_id: user.subscription_id,
        };

        // If subscription_id exists and has value, user has purchased
        if (mapped.subscription_id) {
          purchased.push(mapped);
          totalEarnings += parseInt(mapped.earnings) || 0;
        } else {
          pending.push(mapped);
        }
      });

      return {
        ...res,
        success: ok,
        data: {
          pending,
          purchased,
          totalEarnings,
          pendingCount: pending.length,
          purchasedCount: purchased.length,
        },
      };
    }

    return {
      ...res,
      success: ok,
      data: {
        pending: [],
        purchased: [],
        totalEarnings: 0,
        pendingCount: 0,
        purchasedCount: 0,
      },
    };
  },
};

export default inviteAPI;
