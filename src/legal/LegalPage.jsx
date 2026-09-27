/**
 * /privacy and /tos — REQUIRED. Google's OAuth app registration (the Google Calendar
 * hookup behind /schedule) must link to a privacy policy and terms of service.
 * Don't delete these routes or pages while the Google app exists.
 */
import { Link } from 'react-router-dom';

const UPDATED = 'September 26, 2026';
const CONTACT = 'jonsouyang@ucla.edu';

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What this covers', 'This policy covers the scheduling page on this website (/schedule), where you can book a meeting with Jonathan Ouyang.'],
      ['What we collect', 'When you book, you provide your name, email address, and an optional note. These are used only to create the calendar invite for your meeting and to contact you about it.'],
      ['Calendar access', "The scheduling page reads Jonathan's own Google calendars only as free/busy time blocks (never event titles or details) to show open times, and creates the meeting event on his calendar. It never accesses your calendar."],
      ['Sharing', 'Your information is not sold or shared with anyone. It is stored only in the resulting Google Calendar event, subject to Google’s own privacy policy.'],
      ['Deletion', `To have your information removed, email ${CONTACT}.`],
    ],
  },
  tos: {
    title: 'Terms of Service',
    sections: [
      ['Use', 'The scheduling page on this website lets you request a meeting with Jonathan Ouyang. Please provide accurate information and don’t misuse the service (spam, automated bookings, or attempts to disrupt it).'],
      ['Bookings', 'Bookings may be declined, rescheduled, or cancelled at any time. The service is provided as is, without warranties of any kind.'],
      ['Liability', 'To the fullest extent permitted by law, Jonathan Ouyang is not liable for any damages arising from use of this website or its scheduling page.'],
      ['Changes', 'These terms may change at any time; the date below shows the latest version.'],
      ['Contact', `Questions: ${CONTACT}.`],
    ],
  },
};

export default function LegalPage({ page }) {
  const { title, sections } = PAGES[page];
  return (
    <main className="min-h-screen bg-white text-neutral-800 px-6 py-16">
      <article className="max-w-xl mx-auto">
        <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-800">← Home</Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">Last updated {UPDATED}</p>
        {sections.map(([h, body]) => (
          <section key={h} className="mt-8">
            <h2 className="text-base font-semibold text-neutral-900">{h}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed">{body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
