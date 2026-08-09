import { useState } from 'react';
import api from '../utils/axios';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      await api.post('/support/contact', form);
      setAlert({ type: 'success', text: 'Message sent! We will get back to you shortly.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      setAlert({ type: 'error', text: e.response?.data?.message || 'Failed to send message' });
    } finally {
      setSending(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
        {alert && (
          <div className={`${alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} p-3 rounded mb-4 text-sm`}>{alert.text}</div>
        )}
        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subject</label>
            <input className="w-full border border-gray-300 rounded px-3 py-2" value={form.subject} onChange={(e)=>setForm({...form, subject:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Message</label>
            <textarea rows={6} className="w-full border border-gray-300 rounded px-3 py-2" value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} required />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={sending} className="px-4 py-2 bg-[#ebb665] text-white rounded hover:bg-[#d2a45b] disabled:opacity-50">{sending ? 'Sending...' : 'Send message'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
