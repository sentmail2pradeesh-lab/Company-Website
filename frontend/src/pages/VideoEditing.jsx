import ServicePageLayout from '../components/ServicePageLayout';
import { videoEditing } from '../data/services';

export default function VideoEditing() {
  return <ServicePageLayout data={videoEditing} showBeforeAfter />;
}
