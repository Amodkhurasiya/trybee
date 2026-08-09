import { useEffect, useState } from 'react';
import { userAPI } from '../utils/axios';

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        const user = res.data?.data?.user || res.data?.data || res.data?.user;
        if (mounted && user) {
          setProfile(user);
          setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
        }
      } catch (e) {
        console.error('Load profile failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await userAPI.updateProfile(form);
      const updated = res.data?.data?.user || res.data?.data || form;
      setMessage('Profile updated');
      setProfile(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Update profile failed', e);
      setMessage(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      return setMessage('New password and confirm do not match');
    }
    try {
      setPwdSaving(true);
      await userAPI.changePassword(pwd.currentPassword, pwd.newPassword);
      setMessage('Password changed successfully');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      console.error('Change password failed', e);
      setMessage(e.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-3xl mx-auto px-4"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-6"></div><div className="space-y-3"><div className="h-10 bg-gray-200 rounded"></div><div className="h-10 bg-gray-200 rounded"></div></div></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        {message && (
          <div className="mb-4 p-3 rounded bg-[#fff7e9] text-[#9a6c16] text-sm">{message}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <form onSubmit={updateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">First name</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2" value={form.firstName} onChange={(e)=>setForm({...form, firstName:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Last name</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2" value={form.lastName} onChange={(e)=>setForm({...form, lastName:e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#ebb665] text-white rounded hover:bg-[#d2a45b] disabled:opacity-50">{saving? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          <form onSubmit={changePassword} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Current password</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" value={pwd.currentPassword} onChange={(e)=>setPwd({...pwd, currentPassword:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">New password</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" value={pwd.newPassword} onChange={(e)=>setPwd({...pwd, newPassword:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm new password</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" value={pwd.confirm} onChange={(e)=>setPwd({...pwd, confirm:e.target.value})} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="submit" disabled={pwdSaving} className="px-4 py-2 bg-[#ebb665] text-white rounded hover:bg-[#d2a45b] disabled:opacity-50">{pwdSaving? 'Updating...' : 'Update password'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
