// One-time import: estimated internship application-opening reminders from
// three source documents (mid-July 2026). Creates "Intern" application rows
// against existing companies only. Run with:
//   npx tsx --env-file=.env.local scripts/import-opening-reminders.ts [--apply]
// Without --apply it dry-runs: prints the match table and inserts nothing.

import { neon, neonConfig } from "@neondatabase/serverless";

async function main() {
  const { fetch: uFetch, EnvHttpProxyAgent } = await import("undici");
  const dispatcher = new EnvHttpProxyAgent();
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    neonConfig.fetchFunction = (url: string, init: Record<string, unknown>) =>
      uFetch(url, { ...init, dispatcher });
  }
  const sql = neon(process.env.POSTGRES_URL!);

  // Today per task: 2026-07-13. OPEN NOW => 2026-07-20 (7 days out).
  const OPEN = "2026-07-20";

  type Entry = {
    source: string; // name as written in the source docs
    url: string;
    deadline: string | null;
    openNow?: boolean;
    summary: string;
  };

  // Cross-document dedupe already applied while parsing:
  //  - BlackRock appeared twice in doc 1 (verbatim) -> one entry
  //  - "PayPal" + "Block (Square)" -> single "PayPal / Block" company
  //  - "IFC / World Bank Pioneers Program" + "World Bank Group" -> one entry
  const ENTRIES: Entry[] = [
    // ---- Doc 1: Consulting & Strategy ----
    { source: "Accenture Strategy", url: "https://www.accenture.com/us-en/careers/local/internships-and-student-programs", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically opens Aug-Sep with rolling deadlines through Oct." },
    { source: "Bain & Company", url: "https://www.bain.com/careers/internships-programs.html", deadline: "2027-08-01", summary: "2027 summer applications already closed; next cycle historically opens Aug-Oct 2027 (early action Sept, regular Oct)." },
    { source: "Boston Consulting Group (BCG)", url: "https://careers.bcg.com/global/en/internship-opportunities", deadline: "2027-08-01", summary: "2027 summer applications already closed; next cycle historically opens Aug-Oct 2027 with September priority deadlines." },
    { source: "AlixPartners", url: "https://www.alixpartners.com/careers/students-and-recent-graduates/internships/", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically apps Sept-Jan, rolling." },
    { source: "AlphaSights", url: "https://www.alphasights.com/careers/students-and-interns/", deadline: OPEN, openNow: true, summary: "Summer 2027 Client Service Associate posting live (NY, Jun-Aug 2027); rolling for remaining slots." },
    { source: "Dalberg", url: "https://dalberg.com/join-our-team/", deadline: "2026-08-01", summary: "2027 postings expected Aug 2026; historically apps Aug-Dec, rolling." },
    { source: "EY-Parthenon", url: "https://www.ey.com/en_us/careers/students", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically opens Aug-Oct with ~Oct deadlines." },
    // ---- Doc 1: Finance & Asset Management ----
    { source: "Bank of America", url: "https://careers.bankofamerica.com/en-us/students", deadline: "2026-08-01", summary: "2027 postings expected Aug 2026; historically opens Aug-Sep, most deadlines Oct-Dec." },
    { source: "BlackRock", url: "https://careers.blackrock.com/students-and-graduates-americas", deadline: OPEN, openNow: true, summary: "2027 Summer Internship Americas postings live (apply now); Ops & Technology opened July 2026; historically apps Jul-Nov." },
    // ---- Doc 1: Technology & Software ----
    { source: "Adobe", url: "https://careers.adobe.com/us/en/university", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically rolling Oct-Jan, research roles open as early as Sept." },
    { source: "Airbnb", url: "https://careers.airbnb.com/", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically priority deadlines Oct-Nov." },
    { source: "Amazon", url: "https://www.amazon.jobs/teams/internships-for-students", deadline: "2026-08-01", summary: "2027 SDE/MBA postings expected from Aug 2026; historically opens Aug-Sep, rolling through Dec." },
    { source: "Apple", url: "https://jobs.apple.com/en-us/search?team=internships-STDNT-INTRN", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; SWE/PM roles historically close by Nov." },
    { source: "Cisco", url: "https://careers.cisco.com/global/en/internships-and-co-ops", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically opens Aug, rolling through Dec." },
    { source: "Coca-Cola", url: "https://www.coca-colacompany.com/careers", deadline: "2026-08-01", summary: "2027 postings expected Aug-Oct 2026; historically opens Sept-Nov." },
    { source: "Dropbox", url: "https://www.dropbox.jobs/en/emerging-talent/", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; SWE roles historically close early." },
    // ---- Doc 1: Policy, Think Tanks & Advocacy ----
    { source: "ACLU", url: "https://www.aclu.org/careers/internships/", deadline: "2026-09-01", summary: "Spring 2027 postings historically appear Sept-Oct 2026; summer postings Sept-Jan with ~Nov 15 priority deadline." },
    { source: "Atlantic Council", url: "https://www.atlanticcouncil.org/careers/", deadline: "2026-09-01", summary: "Postings ~2-3 months before each term; Spring 2027 apps historically open Sept-Nov 2026." },
    { source: "Carnegie Endowment for International Peace", url: "https://carnegieendowment.org/internships-at-the-carnegie-endowment-for-international-peace", deadline: "2026-10-01", summary: "Spring 2027 apps likely open ~Oct 2026; Summer 2027 ~Jan 2027. $20/hr." },
    { source: "Center for American Progress (CAP)", url: "https://www.americanprogress.org/about-us/jobs-and-internships/", deadline: "2026-11-01", summary: "Summer 2027 apps typically open ~Nov 2026, close ~mid-Feb 2027." },
    { source: "Center for Global Development (CGD)", url: "https://www.cgdev.org/careers-and-fellowships", deadline: "2027-01-01", summary: "Summer 2027 postings expected Jan-Feb 2027; rolling review, summer is the largest cohort." },
    { source: "CSIS (Center for Strategic & International Studies)", url: "https://careers.csis.org/internships", deadline: OPEN, openNow: true, summary: "Fall 2026 applications accepted on a rolling basis now; Spring 2027 apps historically open Sept-Nov." },
    { source: "Bipartisan Policy Center (BPC)", url: "https://bipartisanpolicy.org/about-us/careers/internships/", deadline: "2026-07-17", openNow: true, summary: "Current cycle deadlines ~July 15-17, 2026 (research/comms); Summer 2027 apps expected ~Jan 2027. $3,000 summer stipend." },
    // ---- Doc 1: Communications, PR & Public Affairs ----
    { source: "Brunswick Group", url: "https://www.brunswickgroup.com/careers/", deadline: "2026-09-01", summary: "2027 postings expected Sept 2026; historically apps Oct-Feb, rolling." },
    { source: "Burson (formerly BCW)", url: "https://bursonglobal.com/careers/", deadline: "2026-08-01", summary: "2027 postings expected Aug-Sep 2026; historically apps Oct-Dec." },
    { source: "Edelman", url: "https://www.edelman.com/careers", deadline: "2026-10-01", summary: "2027 postings expected Oct 2026; historically apps Nov-Mar for the 10-week paid summer program." },
    { source: "FGS Global (formerly Finsbury Glover Hering / The Glover Park Group)", url: "https://fgsglobal.com/join-us/intern-program", deadline: "2026-09-01", summary: "2027 postings expected Sept 2026; historically apps Oct-Feb, rolling; 10-week paid program." },
    // ---- Doc 1: International Development & Multilaterals ----
    { source: "Asian Development Bank (ADB)", url: "https://www.adb.org/work-with-us/careers/internship-program", deadline: OPEN, openNow: true, summary: "2026 Cycle 2 open now, closes ~Sept 15, 2026; two cycles per year (apps Oct-Mar and Jun-Sep)." },
    { source: "EBRD (European Bank for Reconstruction and Development)", url: "https://www.ebrd.com/work-with-us/careers/early-careers.html", deadline: "2026-10-01", summary: "Intern Programme historically opens Oct-Dec for the following year." },
    // ---- Doc 1: NGOs, Advocacy & Social Impact ----
    { source: "Amnesty International", url: "https://www.amnesty.org/en/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Summer postings historically appear Dec-Feb." },
    { source: "Break the Chain Campaign", url: "https://ips-dc.org/careers-internships/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. IPS internships align with academic semesters." },
    { source: "CARE USA", url: "https://www.care.org/careers/", deadline: "2027-01-01", summary: "Summer apps historically open Jan-Apr, rolling; spring Dec-Feb, fall Jun-Aug." },
    { source: "Community Change", url: "https://communitychange.org/who-we-are/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Internships align with academic semesters." },
    { source: "Congressional Hunger Center (Emerson & Leland Fellowships)", url: "https://hungercenter.org/", deadline: "2026-08-01", summary: "2027 Hunger Fellowship apps expected to open ~Aug 2026, deadline ~Oct; annual Sept-Aug cohort." },
    // ---- Doc 1: Additional Organizations ----
    { source: "AARP", url: "https://careers.aarp.org/internships", deadline: "2026-10-01", summary: "Summer 2027 postings historically open ~Oct, rolling review through Jan; recruits via Handshake and own portal." },
    { source: "Acumen Academy", url: "https://acumenacademy.org/fellowship/", deadline: "2026-10-01", summary: "Annual Global Fellowship apps historically open ~Oct, close early Jan." },
    { source: "APCO Worldwide", url: "https://apcoworldwide.com/about/people/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Internships align with academic semesters." },
    { source: "Booz Allen Hamilton", url: "https://careers.boozallen.com/talent/university", deadline: "2026-08-01", summary: "2027 postings expected Aug 2026; historically apps Sept-Dec, rolling; year-round co-op postings." },
    // ---- Doc 2: PR, Communications & Consulting ----
    { source: "FINN Partners", url: "https://www.finnpartners.com/careers/open-positions/", deadline: "2027-03-01", summary: "Rolling year-round; summer roles typically posted Mar-Apr; minimum 4-month full-time commitment." },
    { source: "FP1 Strategies", url: "https://fp1.com/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. No formal program; semester hires via WayUp/Handshake, peaks Mar-May and Sept-Oct." },
    { source: "FleishmanHillard", url: "https://fleishmanhillard.com/join-us/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Heavier posting volume in spring and early summer." },
    { source: "Ketchum (Ketchum Fellowship Program)", url: "https://www.ketchum.com/careers", deadline: "2026-12-01", summary: "Summer 2027 fellowship apps expected to open Dec 2026, close early Feb; program runs Jun-Aug." },
    { source: "MSL", url: "http://mslgroup.com/whats-new-at-msl/msl-us-launches-2026-graduate-fellowship", deadline: "2027-01-01", summary: "Graduate Fellowship apps historically open early Jan for June start; otherwise rolling." },
    { source: "Ogilvy", url: "https://www.ogilvy.com/careers", deadline: "2027-01-01", summary: "Summer 2027 apps typically open Jan-Feb 2027; historically close early Jan — apply immediately on open." },
    { source: "Hill & Knowlton", url: "https://hillandknowlton.com/join-us/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Regional variations; some roles have Mar-Jun deadlines." },
    { source: "Hunter PR", url: "https://hunterpr.com/contact/be-a-hunter/internships", deadline: "2026-12-01", summary: "Summer 2027 apps expected to open Dec 2026, close early Feb; $20/hr, 10-12 week program." },
    { source: "Global Strategy Group", url: "https://globalstrategygroup.com/careers/", deadline: "2027-01-01", summary: "Summer 2027 apps expected early 2027; historically open Jan-Feb for June start." },
    // ---- Doc 2: Foundations & Nonprofits ----
    { source: "Ford Foundation", url: "https://www.fordfoundation.org/about/careers/the-ford-foundation-internship-program/", deadline: "2026-12-01", summary: "2027 apps expected to open Dec 2026; annual 10-week summer program at $38.50/hr." },
    { source: "MacArthur Foundation", url: "https://www.macfound.org/about/employment", deadline: "2026-11-01", summary: "Summer 2027 apps expected to open Nov 2026; historically close late Nov-early Dec, start early June." },
    { source: "Open Society Foundations", url: "https://www.opensocietyfoundations.org/employment/working-at-open-society-foundations", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window." },
    { source: "Obama Foundation", url: "https://www.obama.org/programs/", deadline: "2026-12-01", summary: "Multiple programs: Leaders Program apps ~Dec, Voyager Scholarship ~Mar." },
    { source: "Malala Fund", url: "https://malala.org/hiring", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Minimum 12-week commitment." },
    { source: "Human Rights Watch", url: "https://www.hrw.org/careers", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Generally unpaid; 15-20 hrs/week minimum." },
    { source: "Impact Justice", url: "https://careers.impactjustice.org/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window." },
    { source: "Greater Washington Partnership", url: "https://greaterwashingtonpartnership.com/get-involved/careers/", deadline: OPEN, openNow: true, summary: "Fall 2026 Infrastructure Intern posting active; spring/summer 2027 roles expected; part-time for current students." },
    { source: "Green America", url: "https://greenamerica.org/hiring", deadline: "2027-05-01", summary: "Summer 2027 apps expected spring 2027; summer deadlines typically ~May 1, other roles rolling." },
    { source: "IWPR (Institute for Women's Policy Research)", url: "https://iwpr.org/about/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Spring and fall semester cohorts." },
    // ---- Doc 2: Banking, Finance & Consulting ----
    { source: "JPMorganChase", url: "https://www.jpmorganchase.com/careers/explore-opportunities/students-and-graduates", deadline: "2026-09-01", summary: "Summer 2027 programs open fall 2026; historically Sept-Nov, rolling review through Jan-Feb." },
    { source: "Mastercard", url: "https://careers.mastercard.com/us/en/internships", deadline: "2026-09-01", summary: "Summer 2027 apps open fall 2026; historically opens Sept-Oct, rolling reviews." },
    { source: "McKinsey & Company", url: "https://www.mckinsey.com/careers/students", deadline: "2026-07-01", summary: "Summer 2027 BA apps open late July 2026 (2026 cycle: opened Jul 1, deadline Aug 11); MBA Summer Associate opens late Aug." },
    { source: "Kearney", url: "https://www.kearney.com/careers/opportunities/opportunities-for-students-and-recent-graduates/consulting-internship-program", deadline: "2026-08-01", summary: "Summer 2027 apps open late Aug/Sept 2026; 2026 deadline was Sept 28 with first-round interviews early Oct." },
    { source: "L.E.K. Consulting", url: "https://www.lek.com/careers", deadline: "2026-09-01", summary: "Summer 2027 apps open early Sept 2026; first-round deadline late Sept, final early Oct." },
    { source: "Oliver Wyman", url: "https://www.oliverwyman.com/careers/entry-level.html", deadline: "2026-09-01", summary: "Summer 2027 apps typically open fall 2026; rolling, deadlines can extend into spring." },
    { source: "GLG (Gerson Lehrman Group)", url: "https://glg.com/careers/early-careers", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. ~11-month rolling window for summer cohort." },
    { source: "Forrester", url: "https://www.forrester.com/careers/north-america/internship-program/", deadline: "2026-09-01", summary: "Annual fall recruiting for the following summer." },
    { source: "Gartner", url: "https://jobs.gartner.com/early-careers/internships/", deadline: "2026-09-01", summary: "Summer 2027 apps open fall 2026; rolling; 10-12 week program." },
    { source: "Guidepoint", url: "https://www.guidepoint.com/company/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Multiple cohorts annually; Fall 2026 GPSU cohort Aug 31-Nov 20, $20/hr remote." },
    // ---- Doc 2: International Development & Policy ----
    { source: "IRC (International Rescue Committee)", url: "https://www.rescue.org/volunteer/fall-2026-intern", deadline: OPEN, openNow: true, summary: "Fall 2026 cycle open now — deadline Aug 21, 2026 (Phoenix Aug 10); three cycles per year." },
    { source: "Inter-American Development Bank (IDB)", url: "https://www.iadb.org/en/how-we-can-work-together/students-recent-graduates", deadline: "2026-09-01", summary: "Summer 2027 apps open fall 2026; historically opens ~Sept, rolling review through Nov." },
    { source: "World Bank Group", url: "https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers", deadline: OPEN, openNow: true, summary: "WBG Pioneers Fall/Winter window open July 13-Aug 12, 2026; main cycle Jan-Feb, Treasury summer apps by Oct." },
    { source: "OECD", url: "https://www.oecd.org/en/about/careers/internships.html", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Decisions made twice yearly (spring and fall intakes)." },
    // ---- Doc 2: Technology & Internet ----
    { source: "Google", url: "https://www.google.com/about/careers/applications/internships", deadline: "2026-08-01", summary: "Summer 2027 apps open late Aug/Sept 2026; rolling deadlines through Oct-Dec." },
    { source: "Meta", url: "https://www.metacareers.com/careerprograms/students/", deadline: "2026-08-01", summary: "Summer 2027 apps open late Aug/Sept 2026; rolling with mid-Nov typical deadline." },
    { source: "Microsoft", url: "https://careers.microsoft.com/students/", deadline: "2026-08-01", summary: "Summer 2027 apps historically open Aug-Sep prior year; Explore program opens Oct-Nov." },
    { source: "LinkedIn", url: "https://in.linkedin.com/company/summerinternship", deadline: "2026-08-01", summary: "Summer 2027 apps expected to open Aug/Sept 2026; rolling, final deadline late Oct-Nov." },
    { source: "Netflix", url: "https://jobs.netflix.com/careers/internships", deadline: "2026-08-01", summary: "Summer 2027 apps open mid-Aug to early Sept 2026; limited openings, rolling." },
    { source: "HubSpot", url: "https://www.hubspot.com/careers/emerging-talent", deadline: "2026-09-01", summary: "Summer 2027 apps open fall 2026; historically Sept-Oct; 12-week program." },
    { source: "Intuit", url: "https://www.intuit.com/careers/programs/internships/", deadline: "2026-09-01", summary: "Summer 2027 apps expected fall 2026 (Sept-Nov); Credit Karma roles open ~Nov 1." },
    { source: "Oracle", url: "https://www.oracle.com/careers/students-grads/internships/", deadline: "2026-09-01", summary: "Summer 2027 apps expected Sept 2026; rolling through April." },
    { source: "PayPal / Block (Square)", url: "https://careers.pypl.com/university-hiring/university-overview/", deadline: "2026-09-01", summary: "PayPal: PM apps Sept 15-30, Tech Nov 4-28, 2026. Block/Square: opens early Sept 2026, rolling with Oct priority deadline (careers.squareup.com)." },
    // ---- Doc 2: Media, Entertainment & Consumer ----
    { source: "NBCUniversal", url: "https://www.nbcunicareers.com/internships", deadline: "2026-11-01", summary: "Summer 2027 apps expected Nov 2026; historically open early Nov, program runs Jun-Aug." },
    { source: "National Geographic Society", url: "https://www.nationalgeographic.org/society/internships/", deadline: "2027-01-01", summary: "Summer 2027 apps open Jan 18-Feb 26, 2027 (2026 program was cancelled; resumes 2027)." },
    { source: "LEGO", url: "https://www.lego.com/en-us/careers", deadline: "2027-02-01", summary: "New opportunities expected spring 2027; intakes Feb-Mar (summer start) and Aug-Sep (fall start)." },
    { source: "Nike", url: "https://careers.nike.com/career-areas", deadline: "2026-09-01", summary: "Summer 2027 apps typically open Sept 2026; apply by Sept-Oct for priority; programs run Jan-Jun." },
    { source: "L'Oréal", url: "https://careers.loreal.com/en_US/content/GlobalIntern", deadline: "2026-09-01", summary: "U.S. summer apps historically open Sept (2026 deadline was Sept 30); 10-week programs, $24-29/hr." },
    { source: "New America", url: "https://www.newamerica.org/careers/", deadline: OPEN, openNow: true, summary: "Fall 2026 postings active now; build4good 2027 cohort opens Dec 2026." },
    { source: "ICF", url: "https://careers.icf.com/us/en/the-internship-program", deadline: "2026-09-01", summary: "Summer 2027 recruiting begins Sept 2026, continues until filled or mid-Feb." },
    // ---- Doc 3 ----
    { source: "PepsiCo", url: "https://www.pepsicojobs.com/internshipsprograms", deadline: "2026-08-01", summary: "2027 postings historically open late Aug (2026 cycle: Aug 25-Oct 31); submit by mid-Sept." },
    { source: "Pew Research Center", url: "https://www.pewresearch.org/about/careers/", deadline: "2026-10-01", summary: "Summer 2027 postings typically open Oct, close Jan; strong writing sample required, rolling review." },
    { source: "Procter & Gamble (P&G)", url: "https://www.pgcareers.com/global/en/student-programs", deadline: "2026-08-01", summary: "2027 apps typically open mid/late Aug, close Oct-Nov; complete Pymetrics assessments promptly." },
    { source: "Publicis Groupe", url: "https://www.publicisgroupe.com/en/the-groupe/careers", deadline: "2026-10-01", summary: "Summer 2027 apps typically open Oct, close Jan-Feb; apply across multiple Publicis agencies." },
    { source: "Purpose", url: "https://www.purpose.com/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Small mission-driven agency; continuous postings." },
    { source: "RAND Corporation", url: "https://www.rand.org/jobs", deadline: "2026-09-01", summary: "Summer Associate apps typically open Sept, close Dec; graduate-level research internships." },
    { source: "RepresentWomen", url: "https://www.representwomen.org/job-openings", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Small nonprofit; limited policy/research postings." },
    { source: "Roland Berger", url: "https://www.rolandberger.com/en/Join/Career-Starter/Internship", deadline: "2027-01-01", summary: "Apps historically open Jan, close ~Feb 1 (UK); country-specific deadlines, three interview rounds." },
    { source: "Ruder Finn", url: "https://ruderfinn.com/culture-and-career/", deadline: "2027-03-01", summary: "Executive Training Program (paid 16-week pipeline); cycle historically closes ~Mar 1 — apply by mid-Feb." },
    { source: "SHRM", url: "https://www.shrm.org/about/careers-at-shrm", deadline: "2026-10-01", summary: "Summer apps historically open Oct-Nov, close Dec-Jan; Alexandria VA HQ." },
    { source: "SKDK", url: "https://skdknick.com/careers/", deadline: "2026-10-01", summary: "Summer 2027 apps typically open Oct-Nov 2026, close Jan-Feb; writing sample required." },
    { source: "Salesforce", url: "https://www.salesforce.com/company/careers/university/internships/", deadline: "2026-08-01", summary: "Futureforce Summer 2027 apps typically open Aug-Sep 2026, rolling close Oct-Jan." },
    { source: "ServiceNow", url: "https://careers.servicenow.com/early-career", deadline: "2026-09-01", summary: "Ignite Summer 2027 apps typically open Sept-Nov 2026, close Dec-Jan; rolling review." },
    { source: "Sorenson Impact Institute", url: "https://sorensonimpactinstitute.com/internships/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Impact investing / social innovation focus." },
    { source: "Spitfire Strategies", url: "https://spitfirestrategies.com/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Small mission-driven strategic comms firm." },
    { source: "Spotify", url: "https://www.lifeatspotify.com/start-your-journey/students", deadline: "2026-10-01", summary: "Summer 2027 apps typically open mid-Oct 2026 with a single hard deadline early Feb." },
    { source: "Strategy& (PwC)", url: "https://www.strategyand.pwc.com/us/en/careers/entry-level.html", deadline: "2026-09-01", summary: "Summer 2027 apps typically open Sept, close Nov; rolling reviews, case interviews." },
    { source: "Stripe", url: "https://stripe.com/jobs/university", deadline: "2026-08-01", summary: "Summer 2027 apps typically open Aug, close mid-Nov rolling; apply by Sept — small intern cohort." },
    { source: "Teneo", url: "https://www.teneo.com/careers/open-positions/", deadline: "2026-09-01", summary: "Summer 2027 apps typically open Sept-Oct 2026, close ~late Jan; rolling interviews." },
    { source: "The Aspen Institute", url: "https://www.aspeninstitute.org/about/our-careers/internships/", deadline: "2027-01-01", summary: "Summer 2027 apps typically open Jan, close Mar; 10-week program from early June; apply per program." },
    { source: "The Bridgespan Group", url: "https://www.bridgespan.org/careers-at-bridgespan", deadline: OPEN, openNow: true, summary: "Current Associate Consultant Intern cycle rolling, closes ~Aug 10; next cycle opens Dec-Jan." },
    { source: "The Brookings Institution", url: "https://www.brookings.edu/careers/", deadline: "2026-10-01", summary: "Summer 2027 apps typically open Oct, close Dec-Jan; fall cohort apps open Jul-Aug." },
    { source: "The Case Foundation", url: "https://casefoundation.org/about/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Small foundation, limited postings." },
    { source: "The Urban Institute", url: "https://www.urban.org/about/careers", deadline: "2026-10-01", summary: "Summer 2027 apps typically open Oct, close Dec-Jan; 10-week paid program from late May." },
    { source: "Third Bridge", url: "https://www.thirdbridge.com/en-us/careers/early-careers", deadline: "2026-09-01", summary: "Summer 2027 apps open fall 2026, close winter; Associate Intern roles in NYC/London/HK." },
    { source: "Third Way", url: "https://www.thirdway.org/careers", deadline: "2026-12-01", summary: "Summer 2027 apps typically open Dec 2026, close early Feb." },
    { source: "Toyota Woven by Toyota", url: "https://www.woven.toyota/en/careers/internship", deadline: "2027-02-01", summary: "Apps typically open Feb-Mar 2027, close ~mid-March; June cohort start; rolling review." },
    { source: "UN Women", url: "https://www.unwomen.org/en/about-us/employment/internship-programme", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Master's often required; monitor jobs portal." },
    { source: "UNDP", url: "https://www.undp.org/careers/internships", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Country-office postings; 6-month minimum." },
    { source: "UNICEF", url: "https://www.unicef.org/careers/internships", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Continuous intake with spring/summer peaks; 12-26 weeks." },
    { source: "Uber", url: "https://jobs.uber.com/en/teams/emerging-talent/", deadline: OPEN, openNow: true, summary: "Summer 2027 apps typically open July — open or imminent now; rolling close Oct-Nov." },
    { source: "Unilever", url: "https://careers.unilever.com/early-careers", deadline: "2026-08-01", summary: "Future Leaders apps typically open Aug-Sep 2026, close Nov-Mar by region; multi-round assessment." },
    { source: "Visa", url: "https://corporate.visa.com/en/careers/early-careers.html", deadline: OPEN, openNow: true, summary: "Summer 2027 postings awaiting/open now; historically open Aug, rolling close Oct-Dec." },
    { source: "Warner Bros. Discovery", url: "https://careers.wbd.com/global/en/students-and-recent-graduates", deadline: "2026-09-01", summary: "Summer 2027 apps typically open Sept-Nov 2026, rolling close Jan-Mar." },
    { source: "Weber Shandwick", url: "https://webershandwick.com/careers", deadline: "2026-10-01", summary: "Summer 2027 apps typically open Oct-Dec 2026, close Jan-Feb; writing portfolio recommended." },
    { source: "Wilson Center", url: "https://www.wilsoncenter.org/careers-internships", deadline: "2027-01-01", summary: "Summer 2027 apps typically open Jan-Mar 2027; some paid, some unpaid; foreign-policy focus." },
    { source: "World Economic Forum", url: "https://www.weforum.org/careers/", deadline: null, summary: "Rolling admissions — check periodically, no fixed opening window. Two cohorts/year plus summer; apply 2-3 months before start; 6-month paid program." },
    { source: "World Trade Center Institute (WTCI)", url: "https://www.wtci.org/careers/", deadline: "2026-09-01", summary: "Postings typically open fall; apply by Nov for the spring cohort; Baltimore hybrid." },
    { source: "World Wildlife Fund (WWF)", url: "https://www.worldwildlife.org/about/careers/internships", deadline: "2026-09-01", summary: "Summer postings open 3-4 months prior (fall); apply by Jan-Feb; DC HQ and field offices." },
    { source: "ZS Associates", url: "https://www.zs.com/careers/find-your-path/internships", deadline: "2026-09-01", summary: "Summer 2027 apps typically open Sept, close Nov; 10-11 week program, case-style interviews." },
    { source: "Zoom", url: "https://careers.zoom.us/", deadline: "2026-08-01", summary: "Summer 2027 apps typically open Aug-Sep 2026, rolling close Oct-Dec." },
  ];

  // Programs the sources say don't exist — never inserted.
  const SKIPPED_DISCONTINUED = [
    "FSG (Foundation Strategy Group) — no internships offered per official careers page",
    "Gates Foundation — internship/fellowship programs discontinued in 2021",
  ];

  // ---------- fuzzy matching ----------
  const GENERIC = new Set([
    "the", "and", "of", "for", "in", "a", "an", "group", "company", "co",
    "inc", "llc", "corporation", "institute", "institution", "foundation",
    "center", "centre", "international", "national", "global", "american",
    "america", "worldwide", "usa", "us", "program", "campaign", "society",
    "formerly",
  ]);

  function norm(s: string): string {
    return s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function lev(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
    return dp[m][n];
  }
  const ratio = (a: string, b: string) =>
    1 - lev(a, b) / Math.max(a.length, b.length);

  function tokens(s: string): string[] {
    return norm(s).split(" ").filter((t) => t && !GENERIC.has(t));
  }

  const companies = (await sql`select id, name from companies`) as {
    id: number;
    name: string;
  }[];

  function match(sourceName: string): { id: number; name: string } | null {
    const n = norm(sourceName);
    const t = new Set(tokens(sourceName));
    let best: { id: number; name: string; score: number } | null = null;
    for (const c of companies) {
      const cn = norm(c.name);
      const ct = new Set(tokens(c.name));
      let score = 0;
      if (cn === n) score = 1;
      else if (ratio(cn, n) >= 0.85) score = ratio(cn, n);
      else if (
        (cn.includes(n) || n.includes(cn)) &&
        Math.min(cn.length, n.length) >= 4
      )
        score = 0.9;
      else {
        // token subset (non-generic): "procter gamble p g" vs "procter gamble"
        const small = ct.size <= t.size ? ct : t;
        const large = ct.size <= t.size ? t : ct;
        if (
          small.size > 0 &&
          [...small].every((x) => large.has(x) || [...large].some((y) => ratio(x, y) >= 0.85))
        )
          score = 0.87;
      }
      if (score > 0 && (!best || score > best.score))
        best = { id: c.id, name: c.name, score };
    }
    return best ? { id: best.id, name: best.name } : null;
  }

  // Manual aliases where fuzzy can't bridge the naming gap safely.
  const ALIASES: Record<string, string> = {
    "Procter & Gamble (P&G)": "Procter & Gamble",
    "Boston Consulting Group (BCG)": "BCG",
    "IWPR (Institute for Women's Policy Research)": "Institute for Women's Policy Research",
    "PayPal / Block (Square)": "PayPal / Block",
    "Toyota Woven by Toyota": "Toyota Woven",
    "Congressional Hunger Center (Emerson & Leland Fellowships)": "Congressional Hunger Center",
    "Break the Chain Campaign": "Break the Chain Campaign (Institute for Policy Studies)",
    "EBRD (European Bank for Reconstruction and Development)": "European Bank for Reconstruction and Development (EBRD)",
    "IRC (International Rescue Committee)": "International Rescue Committee (IRC)",
  };

  const apply = process.argv.includes("--apply");
  const unmatched: string[] = [];
  const skippedExisting: string[] = [];
  const planned: {
    entry: Entry;
    companyId: number;
    companyName: string;
  }[] = [];
  const seenCompany = new Map<number, string>();

  const existingInterns = (await sql`
    select company_id from applications where role_title = 'Intern'
  `) as { company_id: number | null }[];
  const hasIntern = new Set(existingInterns.map((r) => r.company_id));

  for (const entry of ENTRIES) {
    const aliasTarget = ALIASES[entry.source];
    const m = aliasTarget
      ? companies.find((c) => c.name === aliasTarget) ?? match(aliasTarget)
      : match(entry.source);
    if (!m) {
      unmatched.push(entry.source);
      continue;
    }
    if (seenCompany.has(m.id)) {
      console.log(
        `DUPLICATE within import: "${entry.source}" -> ${m.name} (already covered by "${seenCompany.get(m.id)}") — skipping`,
      );
      continue;
    }
    seenCompany.set(m.id, entry.source);
    if (hasIntern.has(m.id)) {
      skippedExisting.push(`${entry.source} -> ${m.name}`);
      continue;
    }
    planned.push({ entry, companyId: m.id, companyName: m.name });
  }

  console.log("=== MATCH TABLE ===");
  for (const p of planned) {
    const flag = p.entry.openNow ? " [OPEN NOW]" : p.entry.deadline === null ? " [rolling]" : "";
    console.log(
      `${p.entry.source}  ->  ${p.companyName}  (deadline ${p.entry.deadline ?? "NULL"})${flag}`,
    );
  }
  console.log("\nplanned inserts:", planned.length);
  console.log("unmatched:", JSON.stringify(unmatched));
  console.log("skipped (existing Intern app):", JSON.stringify(skippedExisting));
  console.log("skipped (discontinued):", JSON.stringify(SKIPPED_DISCONTINUED));
  console.log("null-deadline (rolling):", planned.filter((p) => p.entry.deadline === null).length);
  console.log("open-now:", planned.filter((p) => p.entry.openNow).length);

  if (!apply) {
    console.log("\nDRY RUN — nothing inserted. Re-run with --apply.");
    return;
  }

  let inserted = 0;
  for (const p of planned) {
    const notes = `${p.entry.openNow ? "OPEN NOW — " : ""}Estimated opening — verify on site: ${p.entry.url}. ${p.entry.summary}`;
    await sql`
      insert into applications (company_id, role_title, type, status, deadline, location, resume_version, notes)
      values (${p.companyId}, 'Intern', 'internship', 'not_started', ${p.entry.deadline}, null, null, ${notes})
    `;
    inserted++;
  }
  console.log(`\nINSERTED ${inserted} application rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
