import SectionForm from './SectionForm';
import type { EntryField, SectionProps } from './SectionForm';
import { emptyCertificate } from '../types/profile';
import type { Certificate } from '../types/profile';

const fields: EntryField<Certificate>[] = [
  { key: 'name', label: 'Certificate name', required: true },
  { key: 'issuer', label: 'Issuer' },
  { key: 'date', label: 'Date awarded', kind: 'date' },
  { key: 'url', label: 'Certificate website', kind: 'url' },
];

export default function CertificatesForm(props: SectionProps<Certificate>) {
  return <SectionForm {...props} section="certificates" title="Certificates" singular="Certificate"
    description="Add credentials that support your experience." fields={fields} createEntry={emptyCertificate} />;
}
