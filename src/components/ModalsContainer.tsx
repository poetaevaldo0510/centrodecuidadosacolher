import LogModal from './modals/LogModal';
import JournalModal from './modals/JournalModal';
import SettingsModal from './modals/SettingsModal';
import LocationModal from './modals/LocationModal';
import EventModal from './modals/EventModal';
import AboutModal from './modals/AboutModal';
import ReportModal from './modals/ReportModal';
import SellModal from './modals/SellModal';
import SOSModal from './modals/SOSModal';
import ChatModal from './modals/ChatModal';
import UploadPhotoModal from './modals/UploadPhotoModal';
import AddEventModal from './modals/AddEventModal';
import PartnersModal from './modals/PartnersModal';
import { useAppStore } from '@/lib/store';

const ModalsContainer = () => {
  const { activeModal } = useAppStore();

  return (
    <>
      {activeModal === 'log' && <LogModal />}
      {activeModal === 'journal' && <JournalModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'location' && <LocationModal />}
      {activeModal === 'event' && <EventModal />}
      {activeModal === 'about' && <AboutModal />}
      {activeModal === 'report' && <ReportModal />}
      {activeModal === 'sell' && <SellModal />}
      {activeModal === 'sos' && <SOSModal />}
      {activeModal === 'chat' && <ChatModal />}
      {activeModal === 'uploadPhoto' && <UploadPhotoModal />}
      {activeModal === 'addEvent' && <AddEventModal />}
      {activeModal === 'partners' && <PartnersModal />}
    </>
  );
};

export default ModalsContainer;
