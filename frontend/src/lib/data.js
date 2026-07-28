/* =========================================================
   VISTA EDITZ PVT. LTD. — Central content source
   ========================================================= */

export const COMPANY = {
  name: 'Vista Editz',
  legalName: 'Vista Editz Pvt. Ltd.',
  tagline: 'Creative Digital Solutions',
  email: 'hello@vistaedits.com',
  phone: '+91 98765 43210',
  location: 'Bangalore, India · Serving clients worldwide',
  socials: [
    { name: 'LinkedIn', icon: 'linkedin', href: '#' },
    { name: 'Instagram', icon: 'instagram', href: '#' },
    { name: 'Behance', icon: 'behance', href: '#' },
    { name: 'YouTube', icon: 'youtube', href: '#' },
  ],
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services', dropdown: 'services' },
  // { label: 'Portfolio', href: '/#portfolio' },
  //{ label: 'About', href: '/#why' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
];

/* ----- Service summary (navbar dropdown + services overview) ----- */
export const SERVICES = [
  {
    slug: 'photo-editing',
    name: 'Photo Editing',
    icon: 'photo',
    tagline: 'Pixel-perfect imagery that sells.',
    blurb:
      'HDR blending, sky replacement, virtual staging and retouching for real estate, e-commerce and portrait work.',
    color: 'royal',
    route: '/photo-editing',
  },
  {
    slug: 'video-editing',
    name: 'Video Editing',
    icon: 'video',
    tagline: 'Cinematic stories for every screen.',
    blurb:
      'Color grading, motion graphics, reels and corporate films engineered to captivate and convert.',
    color: 'sky',
    route: '/video-editing',
  },
  {
    slug: 'software-development',
    name: 'Software Development',
    icon: 'code',
    tagline: 'Products built to scale.',
    blurb:
      'Web platforms, mobile apps, cloud architecture and AI solutions with elegant, accessible UX.',
    color: 'emerald',
    route: '/software-development',
  },
  {
    slug: 'digital-marketing',
    name: 'Digital Marketing',
    icon: 'growth',
    tagline: 'Growth, measured and multiplied.',
    blurb:
      'SEO, paid media, social and content strategy that puts your brand in front of the right people.',
    color: 'royal',
    route: '/digital-marketing',
  },
];

/* ----- Granular service highlights (per spec) ----- */
export const SERVICE_HIGHLIGHTS = {
  'photo-editing': [
    { label: 'HDR Blending', icon: 'sun' },
    { label: 'Object Removal', icon: 'eraser' },
    { label: 'Sky Replacement', icon: 'cloud' },
    { label: 'Virtual Staging', icon: 'sofa' },
    { label: 'Real Estate Editing', icon: 'home' },
    { label: 'Jewelry Editing', icon: 'gem' },
    { label: 'Portrait Retouching', icon: 'face' },
  ],
  'video-editing': [
    { label: 'Motion Graphics', icon: 'sparkles' },
    { label: 'Corporate Videos', icon: 'briefcase' },
    { label: 'Wedding Films', icon: 'heart' },
    { label: 'Reels & Shorts', icon: 'phone' },
    { label: 'Color Grading', icon: 'droplet' },
    { label: 'YouTube Editing', icon: 'play' },
    { label: 'Marketing Videos', icon: 'megaphone' },
  ],
  'software-development': [
    { label: 'Web Development', icon: 'globe' },
    { label: 'Mobile Apps', icon: 'phone' },
    { label: 'Cloud Solutions', icon: 'cloud' },
    { label: 'Custom Software', icon: 'cube' },
    { label: 'AI Solutions', icon: 'robot' },
    { label: 'UI/UX Design', icon: 'pen' },
  ],
  'digital-marketing': [
    { label: 'SEO', icon: 'search' },
    { label: 'SEM', icon: 'target' },
    { label: 'Google Ads', icon: 'google' },
    { label: 'Meta Ads', icon: 'megaphone' },
    { label: 'Branding', icon: 'star' },
    { label: 'Social Media', icon: 'share' },
    { label: 'Content Marketing', icon: 'doc' },
  ],
};

/* ----- Filmstrip tags for video editing timeline ----- */
export const VIDEO_TAGS = [
  'Motion Graphics',
  'Corporate Films',
  'Wedding Films',
  'Reels & Shorts',
  'Color Grading',
  'YouTube Edits',
  'Marketing Videos',
];

export const MARKETING_TAGS = [
  'SEO',
  'SEM',
  'Google Ads',
  'Meta Ads',
  'Branding',
  'Social Media',
  'Content Marketing',
];

export const STACK_BADGES = [
  'React',
  'Node.js',
  'Next.js',
  'AWS',
  'Mobile',
  'AI / ML',
  'UI/UX',
  'Cloud',
];

/* ----- Trusted clients (placeholder brand names) ----- */
export const TRUSTED_CLIENTS = [
  'Estatery',
  'Lumina Studios',
  'NorthPeak Realty',
  'Carat & Co.',
  'Vertex Agency',
  'Skyline Homes',
  'Marquee E-com',
  'Foundry Labs',
  'Atlas Media',
  'Bright Haus',
];

/* ----- Why Vista bento features ----- */
export const WHY_VISTA = [
  {
    title: '24-hour turnaround',
    desc: 'Fast, reliable delivery on every batch — without compromising quality.',
    icon: 'clock',
    span: 'sm',
    accent: 'emerald',
  },
  {
    title: 'Dedicated project manager',
    desc: 'One point of contact who knows your brand inside out.',
    icon: 'user',
    span: 'sm',
    accent: 'sky',
  },
  {
    title: 'Global delivery team',
    desc: 'Specialists across 5 time zones, working while you sleep.',
    icon: 'globe',
    span: 'sm',
    accent: 'royal',
  },
  {
    title: '100% satisfaction',
    desc: 'Unlimited revisions until it’s exactly right. Guaranteed.',
    icon: 'shield',
    span: 'sm',
    accent: 'emerald',
  },
];

/* ----- Workflow steps ----- */
export const WORKFLOW = [
  {
    step: '01',
    title: 'Discover',
    desc: 'We learn your brand, goals and benchmarks to define a clear creative direction.',
    icon: 'search',
  },
  {
    step: '02',
    title: 'Strategize',
    desc: 'A tailored plan with scope, style guides, timelines and deliverables.',
    icon: 'strategy',
  },
  {
    step: '03',
    title: 'Create',
    desc: 'Our specialists craft your assets with precision and premium polish.',
    icon: 'pen',
  },
  {
    step: '04',
    title: 'Review',
    desc: 'Collaborative revisions through a transparent feedback loop.',
    icon: 'eye',
  },
  {
    step: '05',
    title: 'Deliver',
    desc: 'Pixel-perfect, on-brand assets delivered on time, every time.',
    icon: 'rocket',
  },
];

/* ----- Portfolio ----- */
// export const PORTFOLIO = [
//   {
//     id: 1,
//     title: 'Twilight Estate Transformation',
//     category: 'Photo',
//     image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
//     span: 'tall',
//     featured: true,
//     before: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
//     after: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
//   },
//   {
//     id: 2,
//     title: 'Jewelry Product Spotlight',
//     category: 'Photo',
//     image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
//     span: 'normal',
//   },
//   {
//     id: 3,
//     title: 'Corporate Brand Film',
//     category: 'Video',
//     image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
//     span: 'normal',
//     video: true,
//   },
//   {
//     id: 4,
//     title: 'SaaS Growth Campaign',
//     category: 'Marketing',
//     image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
//     span: 'wide',
//   },
//   {
//     id: 5,
//     title: 'Fintech Mobile App',
//     category: 'Software',
//     image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
//     span: 'normal',
//   },
//   {
//     id: 6,
//     title: 'Real Estate Walkthrough',
//     category: 'Video',
//     image: 'https://images.unsplash.com/photo-1582407947a-cfa5c0b2a0a4?w=800&q=80',
//     span: 'normal',
//     video: true,
//   },
//   {
//     id: 7,
//     title: 'Virtual Staging Suite',
//     category: 'Photo',
//     image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
//     span: 'tall',
//   },
//   {
//     id: 8,
//     title: 'E-commerce Catalog Retouch',
//     category: 'Photo',
//     image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
//     span: 'normal',
//   },
//   {
//     id: 9,
//     title: 'Social Media Reel Series',
//     category: 'Video',
//     image: 'https://images.unsplash.com/photo-1611162616305-c69b3037c7db?w=800&q=80',
//     span: 'normal',
//     video: true,
//   },
// ];

//export const PORTFOLIO_FILTERS = ['All', 'Photo', 'Video', 'Marketing', 'Software'];

/* ----- Testimonials ----- */
// export const TESTIMONIALS = [
//   {
//     quote:
//       'Vista Edits turned around 400 listing photos in under 24 hours — every single one flawless. Our click-through rate jumped 38%.',
//     name: 'Sarah Lin',
//     role: 'Head of Marketing, NorthPeak Realty',
//     avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
//     rating: 5,
//   },
//   {
//     quote:
//       'The color grading on our brand film was cinematic. They understood the brief instantly and elevated it beyond what we imagined.',
//     name: 'Marcus Reed',
//     role: 'Creative Director, Vertex Agency',
//     avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
//     rating: 5,
//   },
//   {
//     quote:
//       'They built our e-commerce platform end to end — fast, beautiful, and our conversions doubled in three months.',
//     name: 'Aisha Khan',
//     role: 'Founder, Marquee E-com',
//     avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
//     rating: 5,
//   },
//   {
//     quote:
//       'Our jewelry catalog has never looked this premium. The detail in the retouching is simply world-class.',
//     name: 'Daniel Cho',
//     role: 'Owner, Carat & Co.',
//     avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
//     rating: 5,
//   },
//   {
//     quote:
//       'From SEO to paid ads, Vista Edits grew our qualified leads by 3x. Truly a data-driven, creative partner.',
//     name: 'Priya Nair',
//     role: 'CMO, Bright Haus',
//     avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
//     rating: 5,
//   },
//   {
//     quote:
//       'Reliable, talented, and genuinely invested in our success. Working with Vista feels like having an in-house team.',
//     name: 'Tom Becker',
//     role: 'CEO, Atlas Media',
//     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
//     rating: 5,
//   },
// ];

/* ----- Statistics ----- */
export const STATS = [
  { value: 2, suffix: 'M+', decimals: 0, label: 'Images Edited', icon: 'image' },
  { value: 10, suffix: 'K+', decimals: 0, label: 'Videos Delivered', icon: 'film' },
  { value: 500, suffix: '+', decimals: 0, label: 'Happy Clients', icon: 'smile' },
  { value: 98, suffix: '%', decimals: 0, label: 'Satisfaction Rate', icon: 'heart' },
];

/* ----- FAQs ----- */
// export const FAQS = [
//   {
//     q: 'What services does Vista Edits offer?',
//     a: 'We provide four core services — Professional Photo Editing, Video Editing, Digital Marketing and Software Development — each delivered by a dedicated team of specialists for real estate, e-commerce, agencies, startups and enterprises.',
//   },
//   {
//     q: 'How fast is your typical turnaround?',
//     a: 'Most photo editing batches are delivered within 24 hours. Video and software projects follow agreed milestones. Urgent requests can be accommodated — just let us know your deadline.',
//   },
//   {
//     q: 'Do you work with international clients?',
//     a: 'Absolutely. We operate across five time zones and serve clients worldwide, with communication, file delivery and project management built for seamless remote collaboration.',
//   },
//   {
//     q: 'Can you handle large-volume orders?',
//     a: 'Yes. Our pipeline is built for scale — from a single hero image to thousands of product photos or long-form video batches — without compromising on quality or consistency.',
//   },
//   {
//     q: 'How does pricing work?',
//     a: 'Pricing is tailored to scope, volume and complexity. Share your project details via the contact form and we’ll send a transparent quote within 24 hours — no hidden fees.',
//   },
//   {
//     q: 'Do you offer revisions?',
//     a: 'Every project includes revisions until you’re completely satisfied. We see revisions as part of the craft, not an extra.',
//   },
//   {
//     q: 'Will my files and data stay secure?',
//     a: 'Always. We follow strict confidentiality practices, use secure transfer channels, and are happy to sign NDAs before any project begins.',
//   },
//   {
//     q: 'How do we get started?',
//     a: 'Click "Get Started" anywhere on the site or fill out the contact form. Tell us what you need, and we’ll respond with a plan and quote within one business day.',
//   },
// ];
