import ServicePageLayout from '../components/ServicePageLayout';
import { photoEditing } from '../data/services';

export default function PhotoEditing() {
  return <ServicePageLayout data={photoEditing} showBeforeAfter />;
}
