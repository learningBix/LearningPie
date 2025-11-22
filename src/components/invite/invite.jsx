import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaFacebookMessenger, FaLinkedin, FaEnvelope, FaCopy, FaFacebook } from "react-icons/fa";
import inviteAPI from "../../services/inviteService";

const Invite = () => {
  const [referralCode] = useState("148417");
  const [referralLink] = useState("https://learningbix.com?refferal=");
  const [copied, setCopied] = useState({ code: false, link: false });
  const [emailInput, setEmailInput] = useState("");
  const [studentName] = useState("Current User");

  // Referral data state
  const [referrals, setReferrals] = useState({
    pending: [],
    purchased: [],
    totalEarnings: 0,
    pendingCount: 0,
    purchasedCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch referral list on mount
  useEffect(() => {
    fetchReferralList();
  }, []);

  const fetchReferralList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await inviteAPI.getReferralList(referralCode);
      if (res.success && res.data) {
        setReferrals(res.data);
      } else {
        setError(res.replyMsg || "Failed to load referrals");
      }
    } catch (err) {
      console.error("fetchReferralList error:", err);
      setError("Error loading referrals");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) {
      setError("Please enter an email address");
      return;
    }

    try {
      setSendingEmail(true);
      setError(null);
      const res = await inviteAPI.sendInviteLink(
        studentName,
        emailInput.trim(),
        `${referralLink}${referralCode}`
      );

      if (res.success) {
        alert(`Invitation sent to: ${emailInput}`);
        setEmailInput("");
        // Optionally refresh referral list
        await fetchReferralList();
      } else {
        setError(res.replyMsg || "Failed to send invitation");
      }
    } catch (err) {
      console.error("sendInviteLink error:", err);
      setError("Error sending invitation");
    } finally {
      setSendingEmail(false);
    }
  };

  // Social share handlers
  const shareLink = `${referralLink}${referralCode}`;
  const shareMessage = `Join me on Learning-Bix! Use my referral code: ${referralCode} to get ₹3,000 voucher. ${shareLink}`;

  const handleWhatsappShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleLinkedinShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleEmailShare = () => {
    const emailUrl = `mailto:?subject=Join Learning-Bix&body=${encodeURIComponent(shareMessage)}`;
    window.location.href = emailUrl;
  };

  const handleGmailFriendsShare = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(shareMessage)}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      {/* Heading */}
      <h2 className="text-3xl font-bold mb-6">Refer & Earn</h2>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-md p-8">
        
        {/* Title */}
        <h3 className="w-3/5 text-2xl md:text-3xl font-bold leading-snug">
          Refer Someone You Know And Both Of You Win Voucher Worth ₹3,000
        </h3>

        {/* Steps Progress */}
        <div className="w-4/5 flex items-center justify-start mt-8 mb-8 flex-wrap gap-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</div>
            <span className="ml-2 text-sm font-medium text-gray-700">Invite Your Friend</span>
          </div>
          <div className="flex-1 min-w-[40px] border-t-2 border-dashed border-orange-300 mx-4"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</div>
            <span className="ml-2 text-sm font-medium text-gray-700">Your Friend Sign-Up</span>
          </div>
          <div className="flex-1 min-w-[40px] border-t-2 border-dashed border-orange-300 mx-4"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</div>
            <span className="ml-2 text-sm font-medium text-gray-700">Both Of You Earn Reward</span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          
          {/* Left Side - Form */}
          <div>
            {/* Select Program */}
            <div className="mb-6">
              <label className="font-semibold text-gray-700 box mb-2">Select Program</label>
              <select className="w-full border-2 border-blue-300 rounded-full px-5 py-3 bg-white focus:outline-none focus:border-orange-400">
                <option>PreSchool Program</option>
                <option>Coding Program</option>
                <option>Robotics Program</option>
                <option>Self Pace Program</option>
              </select>
            </div>

            {/* Referral Code & Link Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Referral Code */}
              <div>
                <label className="font-semibold text-gray-700 box mb-2">Share your Referral code</label>
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">
                  <input
                    readOnly
                    className="flex-1 px-5 py-3 outline-none bg-transparent text-sm"
                    value={referralCode}
                  />
                  <button 
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border-l border-gray-300 flex items-center justify-center"
                    onClick={() => handleCopy(referralCode, 'code')}
                    title="Copy Code"
                  >
                    <FaCopy className={`text-lg ${copied.code ? 'text-green-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              {/* Referral Link */}
              <div>
                <label className="font-semibold text-gray-700 box mb-2">Share your Referral Link</label>
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">
                  <input
                    readOnly
                    className="flex-1 px-5 py-3 outline-none bg-transparent text-sm"
                    value={`${referralLink}${referralCode}`}
                  />
                  <button 
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border-l border-gray-300"
                    onClick={() => handleCopy(`${referralLink}${referralCode}`, 'link')}
                    title="Copy Link"
                  >
                    <FaCopy className={`text-lg ${copied.link ? 'text-green-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Or Share via */}
            <div className="mb-6 text-center">
              <h4 className="font-semibold text-gray-700 mb-3">Or Share via</h4>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={handleWhatsappShare}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                  title="Share via WhatsApp"
                >
                  <FaWhatsapp className="text-xl" />
                </button>
                <button 
                  onClick={handleFacebookShare}
                  className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition"
                  title="Share via Facebook Messenger"
                >
                  <FaFacebookMessenger className="text-xl" />
                </button>
                <button 
                  onClick={handleLinkedinShare}
                  className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition"
                  title="Share via LinkedIn"
                >
                  <FaLinkedin className="text-xl" />
                </button>
                <button 
                  onClick={handleEmailShare}
                  className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                  title="Share via Email"
                >
                  <FaEnvelope className="text-xl" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-200" />

            {/* Invite Buttons Row */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button 
                onClick={handleWhatsappShare}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition"
              >
                <FaWhatsapp className="text-lg" />
                Invite via Whatsapp
              </button>
              <button 
                onClick={handleGmailFriendsShare}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition"
              >
                <FaEnvelope className="text-lg" />
                Invite Gmail Friends
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button 
                onClick={handleFacebookShare}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition"
              >
                <FaFacebook className="text-lg" />
                Invite via Facebook
              </button>
              <button 
                onClick={handleLinkedinShare}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition"
              >
                <FaLinkedin className="text-lg" />
                Invite via Linkedin
              </button>
            </div>

            {/* Add Emails Section */}
            <div>
              <label className="font-semibold text-gray-700 box mb-2">Add Emails</label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="flex-1 border border-gray-300 rounded-full px-5 py-3 outline-none focus:border-orange-400"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendEmail();
                  }}
                />
                <button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Sending...' : 'Send'}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="flex items-start justify-center">
            <img
              src="https://img.freepik.com/free-vector/refer-friend-concept-illustration_114360-7039.jpg"
              alt="Refer & Earn"
              className="max-w-full h-auto max-h-96 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Your Referrals Section */}
      <h2 className="text-3xl font-bold mt-10 mb-6">Your referrals</h2>

      <div className="bg-white rounded-xl shadow-md p-6">
    
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-orange-100 rounded-lg flex flex-col items-center text-center">
            <span className="font-semibold text-gray-700 mb-4">Total Earning</span>
            <span className="text-4xl font-bold text-gray-900">₹ {referrals.totalEarnings || 0}</span>
          </div>

          <div className="p-6 bg-orange-100 rounded-lg flex flex-col items-center text-center">
            <span className="font-semibold text-gray-700 mb-4">Registered for Trial</span>
            <span className="text-4xl font-bold text-gray-900">{referrals.pendingCount || 0}</span>
          </div>

          <div className="p-6 bg-orange-100 rounded-lg flex flex-col items-center text-center">
            <span className="font-semibold text-gray-700 mb-4">Purchased</span>
            <span className="text-4xl font-bold text-gray-900">{referrals.purchasedCount || 0}</span>
          </div>
        </div>

        {/* Remind Button */}
        <div className="text-center mb-8">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold">
            Remind them on WhatsApp
          </button>
        </div>

        {/* Pending User Table */}
        <h3 className="text-2xl font-bold mb-4">Pending User</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">S.No.</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
                {/* <th className="py-3 px-4 font-semibold text-gray-700">Email</th> */}
                <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Reward on enrolment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-b border-gray-100">
                  <td colSpan="5" className="py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : referrals.pending.length === 0 ? (
                <tr className="border-b border-gray-100">
                  <td colSpan="5" className="py-8 text-center text-gray-400">No Data Available</td>
                </tr>
              ) : (
                referrals.pending.map((user, idx) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{idx + 1}</td>
                    <td className="py-3 px-4 text-gray-700">{user.name}</td>
                    <td className="py-3 px-4 text-gray-700">{user.email || '-'}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">₹ {user.earnings || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Purchased User Table */}
        <h3 className="text-2xl font-bold mb-4">Purchased User</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">S.No.</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
                {/* <th className="py-3 px-4 font-semibold text-gray-700">Email</th> */}
                {/* <th className="py-3 px-4 font-semibold text-gray-700">Course</th> */}
                <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Reward Received</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-b border-gray-100">
                  <td colSpan="6" className="py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : referrals.purchased.length === 0 ? (
                <tr className="border-b border-gray-100">
                  <td colSpan="6" className="py-8 text-center text-gray-400">No Data Available</td>
                </tr>
              ) : (
                referrals.purchased.map((user, idx) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{idx + 1}</td>
                    <td className="py-3 px-4 text-gray-700">{user.name}</td>
                    <td className="py-3 px-4 text-gray-700">{user.email || '-'}</td>
                    <td className="py-3 px-4 text-gray-700">{user.course_name}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Purchased
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">₹ {user.earnings || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invite;