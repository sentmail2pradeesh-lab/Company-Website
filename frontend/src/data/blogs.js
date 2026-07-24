export const blogPosts = [
  {
    id: 1,
    title: 'The Future of AI in Photo Editing',
    excerpt:
      'Discover how artificial intelligence is revolutionizing the way we edit and enhance images.',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    created_at: '2025-07-15',
    author: 'ASZEN Editorial Team',
    content: `Artificial intelligence is transforming photo editing at an unprecedented pace. At ASZEN Technologies, we integrate AI-assisted tools with human expertise to deliver faster turnaround without compromising quality.

From automated sky replacements and intelligent object removal to smart color matching across large batches, AI enables our editors to focus on creative decisions while routine tasks are handled efficiently.

For real estate photographers and e-commerce brands, this means consistent results across hundreds of images per day. Our hybrid approach — combining AI preprocessing with professional manual refinement — ensures every photo meets the highest standards before delivery.

The future belongs to editors who embrace technology while maintaining the artistic eye that machines cannot replicate. ASZEN is at the forefront of this evolution, helping clients stay ahead in a visually driven marketplace.`,
  },
  {
    id: 2,
    title: 'Video Editing Trends for 2025',
    excerpt:
      'Stay ahead with the latest techniques and tools shaping professional video production.',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
    created_at: '2025-07-10',
    author: 'ASZEN Editorial Team',
    content: `Video content continues to dominate digital marketing, and 2025 brings exciting shifts in how professionals edit and deliver footage. Short-form content remains king, but long-form storytelling is making a strong comeback on platforms like YouTube and LinkedIn.

Color grading trends are moving toward natural, film-inspired looks rather than oversaturated styles. Our editors at ASZEN specialize in cinematic color science that enhances mood without looking artificial.

AI-powered tools for stabilization, noise reduction, and auto-captioning are now standard in professional workflows. We leverage these technologies to reduce production time while maintaining broadcast-quality output.

For real estate and corporate clients, 4K delivery with optimized web versions is now expected. ASZEN's video team ensures your content looks stunning on every screen — from mobile feeds to presentation displays.`,
  },
  {
    id: 3,
    title: 'Real Estate Photography Tips',
    excerpt:
      'Learn how to capture stunning property photos that sell faster and at better prices.',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    created_at: '2025-07-05',
    author: 'ASZEN Editorial Team',
    content: `Great real estate photography starts before the edit — but post-production is where good photos become great listings. Here are professional tips from the ASZEN editing team.

Shoot in RAW format whenever possible. This gives editors maximum flexibility for exposure correction, white balance adjustment, and HDR blending. Wide-angle lenses work best for interiors, but avoid distortion that makes rooms look unnaturally large.

Natural light is your best friend. Schedule shoots during golden hour for exteriors, and open all blinds for bright, inviting interior shots. Turn on all lights inside to eliminate dark corners.

After capture, professional editing makes the difference. HDR blending, vertical correction, sky enhancement, and twilight conversion can increase listing engagement by up to 40%. ASZEN's real estate editing packages are designed specifically for agents and photographers who need consistent, fast, high-quality results.`,
  },
];

export function getBlogById(id) {
  return blogPosts.find((b) => b.id === Number(id));
}
