import { getClinicData } from '@/lib/clinic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutClinic from '@/components/AboutClinic';
import Services from '@/components/Services';
import Benefits from '@/components/Benefits';
import OurApproach from '@/components/OurApproach';
import TrustSection from '@/components/TrustSection';
import Location from '@/components/Location';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default async function HomePage() {
  const clinicSlug = process.env.NEXT_PUBLIC_CLINIC_SLUG || 'consultorio-ensigna';
  
  let clinic = null;

  try {
    clinic = await getClinicData(clinicSlug);
  } catch (err) {
    console.error('Error loading clinic data:', err);
    // Si hay error, clinic queda null y los componentes lo manejan
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <Hero />
      <AboutClinic clinic={clinic} />
      <Services />
      <Benefits />
      <OurApproach />
      <TrustSection />
      <Location clinic={clinic} />
      <CTA clinic={clinic} />
      <Footer clinic={clinic} />
    </main>
  );
}
