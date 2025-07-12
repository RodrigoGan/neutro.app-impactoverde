import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import RegisterStart from "./pages/register/RegisterStart";
import NotFound from "./pages/NotFound";
import CollectorRegister from "./pages/register/CollectorRegister";
import Levels from "./pages/Levels";
import UserLevels from "./pages/user/Levels";
import CompanyLogin from "./pages/auth/CompanyLogin";
import Login from "./pages/auth/Login";
import CompanyCollectors from '@/pages/company/CompanyCollectors';
import LinkExistingCollector from '@/pages/company/LinkExistingCollector';
import { IndividualCollectorRegister } from '@/pages/collector/IndividualCollectorRegister';
import { CollectorSchedule } from '@/pages/collector/CollectorSchedule';
import { CompanyPricing } from '@/pages/company/CompanyPricing';
import { PriceConsultation } from '@/pages/collector/PriceConsultation';
import Coupons from './pages/collector/Coupons';
import DailySchedule from './pages/collector/DailySchedule';
import UserCoupons from './pages/user/UserCoupons';
import { default as UserRecurringSchedules } from './pages/user/RecurringSchedules';
import { default as CollectorRecurringSchedules } from './pages/collector/RecurringSchedules';
import RegisterCollection from './pages/collector/RegisterCollection';
import UserProfile from './pages/user/UserProfile';
import Achievements from './pages/user/Achievements';
import EnvironmentalImpact from './pages/user/EnvironmentalImpact';
import VolumeDetails from './pages/collector/VolumeDetails';
import { default as ActiveClients } from './pages/collector/ActiveClients';
import { default as Points } from './pages/collector/Points';
import CollectorSettings from './pages/collector/CollectorSettings';
import CollectorEnvironmentalImpact from './pages/collector/EnvironmentalImpact';
import CompanySettings from './pages/company/CompanySettings';
import StandardDashboard from './pages/dashboard/StandardDashboard';
import SearchCouponsPage from './pages/coupons/SearchCouponsPage';
import { CreateCouponPage } from '@/pages/partner/CreateCouponPage';
import StandardEnvironmentalImpactPage from './pages/dashboard/StandardEnvironmentalImpactPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AnimationsDemo from './pages/dashboard/AnimationsDemo';
import LevelsImprovementTracker from './pages/dashboard/LevelsImprovementTracker';
import TeamMemberRegister from './pages/company/TeamMemberRegister';
import PartnerTeamMemberRegister from './pages/partner/TeamMemberRegister';
import TeamMembersList from './pages/partner/TeamMembersList';
import CooperativeSettings from './pages/cooperative/CooperativeSettings';
import PartnerSettings from './pages/partner/PartnerSettings';
import StandardUserLevels from './pages/standard/UserLevels';
import StandardCommunityAchievements from './pages/standard/StandardCommunityAchievements';
import CooperativeActionsPage from './pages/standard/cooperative-actions';
import CooperativeRequests from './pages/cooperative/CooperativeRequests';
import CompanyRequests from './pages/company/CompanyRequests';
import CompanyCollections from './pages/company/CompanyCollections';
import CompanyFleet from './pages/company/CompanyFleet';
import CooperativeFleet from './pages/cooperative/CooperativeFleet';
import CooperativeCollections from './pages/cooperative/CooperativeCollections';
import PartnerCouponsHistory from './pages/partner/PartnerCouponsHistory';
import CouponsManagement from './pages/partner/coupons/Management';
import EditCouponPage from '@/pages/partner/coupons/EditCouponPage';
import PartnerRecurringSchedules from '@/pages/partner/PartnerRecurringSchedules';
import CollectionSimple from '@/pages/CollectionSimple';
import CollectionRecurring from './pages/collection/CollectionRecurring';
import EditCollector from './pages/register/EditCollector';
import StandardCollectionHistory from './pages/StandardCollectionHistory';
import StandardRatingFormDemo from '@/components/collection/StandardRatingFormDemo';
import PartnerCompanySettings from './pages/company/PartnerCompanySettings';
import BuyRecyclables from './pages/company/BuyRecyclables';
import ReceiptHistory from './pages/company/ReceiptHistory';
import SellRecyclables from './pages/collector/SellRecyclables';
import SalesReceiptHistory from './pages/sales/ReceiptHistory';
import FinancialOverview from './pages/standard/FinancialOverview';
import PaidPlans from "./pages/PaidPlans";
import CertificateExamples from "./pages/CertificateExamples";
import NewRegister from './pages/register/NewRegister';
import ActiveSchedules from './pages/ActiveSchedules';
import { PointsDemo } from './components/levels/PointsDemo';
import CreateCoupon from './pages/partner/coupons/Create';
import ReferralPage from './pages/user/ReferralPage';
import { registerRoutes } from './routes/register.routes';

const queryClient = new QueryClient();

// Wrapper Components - REMOVER
/*
const CollectionSimpleWrapper = () => {
  const location = useLocation();
  const profileType = location.state?.profileType || 'user';
  // @ts-ignore TODO: Ajustar props se necessário depois que CollectionSimple for atualizado
  return <CollectionSimple profileType={profileType} />;
};

const CollectionRecurringWrapper = () => {
  const location = useLocation();
  const profileType = location.state?.profileType || 'user';
  // @ts-ignore TODO: Ajustar props se necessário depois que CollectionRecurring for atualizado
  return <CollectionRecurring profileType={profileType} />;
};
*/

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/register/new" element={<NewRegister />} />
          <Route path="/register" element={<RegisterStart />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/dashboard/standard" element={<StandardDashboard />} />
          <Route path="/dashboard/animations-demo" element={<AnimationsDemo />} />
          <Route path="/dashboard/levels-improvement-tracker" element={<LevelsImprovementTracker />} />
          <Route path="/dashboard/points-demo" element={<PointsDemo />} />
          <Route path="/cupons/buscar" element={<SearchCouponsPage />} />
          <Route path="/standard/levels" element={<StandardUserLevels />} />
          <Route path="/standard/community-achievements" element={<StandardCommunityAchievements />} />
          <Route path="/standard/cooperative-actions" element={<CooperativeActionsPage />} />
          
          {/* User Routes */}
          <Route path="/user/levels" element={<UserLevels />} />
          <Route path="/user/coupons" element={<UserCoupons />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/recurring-schedules" element={<UserRecurringSchedules />} />
          <Route path="/user/achievements" element={<Achievements />} />
          <Route path="/user/environmental-impact" element={<EnvironmentalImpact />} />
          <Route path="/user/referral" element={<ReferralPage />} />
          
          {/* Collector Routes */}
          <Route path="/collector/daily-schedule" element={<DailySchedule />} />
          <Route path="/collector/price-consultation" element={<PriceConsultation />} />
          <Route path="/collector/coupons" element={<Coupons />} />
          <Route path="/collector/recurring-schedules" element={<CollectorRecurringSchedules />} />
          <Route path="/collector/register-collection" element={<RegisterCollection />} />
          <Route path="/collector/register/individual" element={<IndividualCollectorRegister />} />
          <Route path="/collector/schedule/:collectorId" element={<CollectorSchedule />} />
          <Route path="/collector/volume-details" element={<VolumeDetails />} />
          <Route path="/collector/active-clients" element={<ActiveClients />} />
          <Route path="/collector/points" element={<Points />} />
          <Route path="/collector/settings" element={<CollectorSettings />} />
          <Route path="/collector/environmental-impact" element={<CollectorEnvironmentalImpact />} />
          <Route path="/collector/sell-recyclables" element={<SellRecyclables />} />
          
          {/* Company Routes */}
          <Route path="/company-login" element={<CompanyLogin />} />
          <Route path="/company/pricing" element={<CompanyPricing />} />
          <Route path="/company-collectors" element={<CompanyCollectors />} />
          <Route path="/company/settings" element={<CompanySettings />} />
          <Route path="/link-existing-collector" element={<LinkExistingCollector />} />
          <Route path="/company/requests" element={<CompanyRequests />} />
          <Route path="/company/daily-collections" element={<CompanyCollections />} />
          <Route path="/company-fleet" element={<CompanyFleet />} />
          <Route path="/company/buy-recyclables" element={<BuyRecyclables />} />
          <Route path="/company/receipt-history" element={<ReceiptHistory />} />
          
          {/* Other Routes */}
          <Route path="/dashboard/impacto-ambiental/:userId" element={<StandardEnvironmentalImpactPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/cooperativa/equipe/novo" element={<TeamMemberRegister />} />
          <Route path="/parceiro/equipe/novo" element={<PartnerTeamMemberRegister />} />
          <Route path="/empresa/equipe/novo" element={<TeamMemberRegister />} />
          <Route path="/cooperative-settings" element={<CooperativeSettings />} />
          <Route path="/partner-settings" element={<PartnerSettings />} />
          <Route path="/cooperative/requests" element={<CooperativeRequests />} />
          <Route path="/cooperative-fleet" element={<CooperativeFleet />} />
          <Route path="/cooperative/collections" element={<CooperativeCollections />} />
          <Route path="/partner/coupons-history" element={<PartnerCouponsHistory />} />
          <Route path="/partner/coupons-management" element={<CouponsManagement />} />
          <Route path="/partner/recurring-schedules" element={<PartnerRecurringSchedules />} />
          
          {/* NOVAS ROTAS UNIFICADAS */}
          <Route path="/collection/simple" element={<CollectionSimple />} />
          <Route path="/collection/recurring" element={<CollectionRecurring />} />

          {/* Catch-all route */}
          <Route path="/collection-history" element={<StandardCollectionHistory />} />
          <Route path="/rating-form-demo" element={<StandardRatingFormDemo />} />
          <Route path="/partner-company/settings" element={<PartnerCompanySettings />} />
          <Route path="/company/team-members" element={<TeamMembersList />} />
          <Route path="/cooperative/sell-recyclables" element={<SellRecyclables />} />
          <Route path="/sales/receipt-history" element={<SalesReceiptHistory />} />
          <Route path="/financial-overview" element={<FinancialOverview />} />
          <Route path="/planos" element={<PaidPlans />} />
          <Route path="/certificate-examples" element={<CertificateExamples />} />
          <Route path="/active-schedules" element={<ActiveSchedules />} />
          <Route path="/partner/coupons/create" element={<CreateCoupon />} />
          <Route path="/partner/coupons/edit" element={<EditCouponPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/edit-collector/:id" element={<EditCollector />} />
          <Route path="/partner/team-members-list" element={<TeamMembersList />} />
          
          {/* Register Routes */}
          {registerRoutes}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
