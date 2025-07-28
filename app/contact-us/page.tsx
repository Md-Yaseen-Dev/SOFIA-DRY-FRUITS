
'use client';

import ContactModal from '@/components/ContactModal';

export default function ContactUsPage() {
  return (
    <div>
      <ContactModal onClose={() => console.log('closed')} />
    </div>
  );
}
