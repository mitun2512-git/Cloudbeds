/**
 * Blog System - SEO-optimized blog listing and post pages
 * Target keywords: napa valley travel guide, wine country tips
 */

import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePageMeta, BreadcrumbSchema, ArticleSchema } from '../seo';
import './Blog.css';

// Blog posts data (in production, this would come from a CMS)
export const blogPosts = [
  {
    slug: 'bottlerock-2026-guide',
    title: 'BottleRock 2026 Complete Guide: Where to Stay, Eat & Recover',
    excerpt: 'Everything you need to know for BottleRock Napa Valley 2026. From accommodation tips to recovery strategies.',
    content: `
# BottleRock 2026 Complete Guide

BottleRock Napa Valley is one of the most anticipated music festivals of the year, combining world-class performances with Napa's legendary wine and culinary scene. Here's your complete guide to making the most of BottleRock 2026.

## When is BottleRock 2026?

BottleRock typically takes place over Memorial Day weekend in late May. For 2026, expect dates around May 22-24, 2026 (dates to be confirmed).

## Where to Stay for BottleRock

**The Smart Strategy:** Stay within walking distance of the festival at Napa Valley Expo. Hennessey Estate is just a 15-minute walk from the venue, making it the perfect home base.

### Why Stay at Hennessey Estate for BottleRock

1. **Walk to the Festival** - No parking hassles, no ride-share surge pricing
2. **Recovery Pool** - Nothing beats a post-festival swim in our heated pool
3. **Real Breakfast** - Start your day with chef-prepared breakfast, not festival food
4. **Quiet Sleep** - Our Victorian rooms are peaceful retreats from the festival energy
5. **Downtown Access** - Walk to restaurants when you need a festival break

## Festival Survival Tips

### What to Bring
- Comfortable shoes (you'll be standing all day)
- Sunscreen and hat (May in Napa can be hot)
- Light layers for evening
- Portable phone charger
- Cash and cards

### Pace Yourself
BottleRock is a marathon, not a sprint. With three days of music, plus Napa's amazing restaurants and tasting rooms, you'll want to:

- Take breaks between sets
- Stay hydrated (the festival has water stations)
- Use the culinary stage as a rest opportunity
- Head back to your hotel for an afternoon pool session

## Best Restaurants Near BottleRock

After a day at the festival, these downtown Napa restaurants are perfect for refueling:

1. **Gran Eléctrica** - Mexican street food, casual vibe
2. **Tarla** - Mediterranean, great for groups
3. **Cole's Chop House** - Classic steakhouse
4. **Morimoto** - Upscale Japanese

## Book Early

BottleRock accommodation sells out fast. If you're planning to attend, book your Hennessey Estate stay as soon as festival dates are announced. Our guests typically book 4-6 months in advance.

*Planning your BottleRock trip? [Book your stay at Hennessey Estate](/book) and walk to the festival.*
    `,
    image: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_1200,h_630,al_c,q_90/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg',
    category: 'Events',
    tags: ['BottleRock', 'Music Festivals', 'Napa Events', 'Travel Tips'],
    author: 'Hennessey Estate',
    datePublished: '2026-01-10',
    readTime: '8 min read',
    featured: true,
  },
  {
    slug: 'downtown-napa-restaurants-walking-distance',
    title: '10 Best Restaurants Walking Distance from Downtown Napa',
    excerpt: 'Your guide to the best dining experiences within a short walk of downtown Napa, from Michelin-starred to casual favorites.',
    content: `
# 10 Best Restaurants Walking Distance from Downtown Napa

One of the best things about staying at Hennessey Estate is the incredible dining within walking distance. No driving, no parking, no designated driver needed. Here are our top 10 recommendations.

## Fine Dining

### 1. Angèle Restaurant (4 min walk)
French-California cuisine in a beautiful riverside setting. The duck confit and steak frites are legendary.

### 2. Morimoto Napa (8 min walk)
Celebrity chef Masaharu Morimoto's wine country outpost. The omakase is worth every penny.

### 3. Torc (5 min walk)
Farm-to-table fine dining with an ever-changing menu based on seasonal ingredients.

## Casual Favorites

### 4. Gran Eléctrica (7 min walk)
Brooklyn-style Mexican with incredible tacos and margaritas.

### 5. Tarla Mediterranean Grill (6 min walk)
Fresh Mediterranean cuisine, perfect for groups and warm evenings on the patio.

### 6. Oxbow Public Market (6 min walk)
Not one restaurant but dozens of food vendors. Perfect for groups with different tastes.

## Classic Napa

### 7. Cole's Chop House (5 min walk)
The quintessential Napa steakhouse. Dry-aged beef, extensive wine list.

### 8. Celadon (4 min walk)
Napa comfort food meets global influences in a cozy setting.

## Hidden Gems

### 9. Ca' Momi Osteria (6 min walk)
Authentic Italian from the Ca' Momi winery team.

### 10. Bounty Hunter Wine Bar (5 min walk)
BBQ meets wine bar with an incredible whiskey collection.

## Pro Tips

- **Make Reservations**: Especially for Angèle, Morimoto, and Torc
- **Walk Off Dinner**: The Napa River Trail is beautiful after dark
- **Wine Pairings**: Most restaurants offer excellent local wine pairings

*Staying at Hennessey Estate? Our concierge is happy to make reservations for you.*
    `,
    image: 'https://static.wixstatic.com/media/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg/v1/fill/w_1200,h_630,q_90/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg',
    category: 'Dining',
    tags: ['Restaurants', 'Downtown Napa', 'Food Guide', 'Wine Country Dining'],
    author: 'Hennessey Estate',
    datePublished: '2026-01-08',
    readTime: '6 min read',
    featured: true,
  },
  {
    slug: 'first-time-napa-valley-3-day-itinerary',
    title: 'Napa Valley for First-Timers: The Perfect 3-Day Itinerary',
    excerpt: 'Never been to Napa? Here\'s how to make the most of your first wine country visit with our local\'s guide.',
    content: `
# Napa Valley for First-Timers: The Perfect 3-Day Itinerary

Welcome to Napa Valley! As hosts to thousands of first-time visitors, we've crafted the perfect 3-day itinerary that balances wine tasting, amazing food, and relaxation.

## Day 1: Downtown Napa & Wine Basics

### Morning
- Arrive and check in at Hennessey Estate (3 PM)
- Take a quick walk to explore downtown Napa
- Visit the Downtown Napa Tasting Collective (15+ wineries under one roof)

### Afternoon
- Pool and spa time at the estate
- Light snack at Oxbow Public Market

### Evening
- Dinner at Angèle (make reservations!)
- After-dinner stroll along the Napa River

## Day 2: Wine Country Exploration

### Morning
- Chef-prepared breakfast at the estate
- Drive to Silverado Trail
- Visit Stag's Leap Wine Cellars (reserve tastings)

### Afternoon
- Lunch in Yountville (Bouchon Bakery or Redd Wood)
- One more tasting: Domaine Carneros for sparkling wine

### Evening
- Return to the estate for pool/sauna
- Evening wine hour in our tasting room
- Casual dinner downtown (Gran Eléctrica)

## Day 3: Relax & Explore

### Morning
- Leisurely breakfast
- Optional: Hot air balloon ride (book weeks ahead!)
- Or: Morning at CIA at Copia

### Afternoon
- Final tasting: Stay downtown at one of the walking-distance rooms
- Shopping at First Street Napa

### Evening
- Sunset swim
- Farewell dinner at Torc or Cole's

## First-Timer Tips

1. **Don't Over-Schedule**: 2-3 tastings per day is plenty
2. **Eat Breakfast**: Our chef-prepared breakfast sets you up right
3. **Use a Driver**: For any wine country driving, consider a car service
4. **Book Ahead**: Popular restaurants and experiences book up
5. **Stay Central**: Downtown Napa is the best base for first-timers

*Ready to plan your first Napa trip? [Book your stay at Hennessey Estate](/book)*
    `,
    image: 'https://static.wixstatic.com/media/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg/v1/fill/w_1200,h_630,q_90/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg',
    category: 'Travel Guide',
    tags: ['First Time Visitors', 'Napa Itinerary', 'Wine Tasting', 'Travel Planning'],
    author: 'Hennessey Estate',
    datePublished: '2026-01-05',
    readTime: '7 min read',
    featured: true,
  },
  {
    slug: 'winter-napa-valley-hidden-gem',
    title: 'Winter in Napa Valley: Why Off-Season is the Best-Kept Secret',
    excerpt: 'Discover why savvy travelers choose winter for their Napa Valley escape. Lower prices, fewer crowds, and cozy vibes.',
    content: `
# Winter in Napa Valley: Why Off-Season is the Best-Kept Secret

Think Napa Valley is only for summer visits? The locals (and savvy travelers) know better. Winter in wine country offers a completely different—and arguably better—experience.

## Why Visit Napa in Winter

### 1. Lower Prices
Winter rates at hotels and B&Bs are significantly lower than peak season. At Hennessey Estate, you might save $200-400 per night compared to summer rates.

### 2. No Crowds
Imagine tasting rooms to yourself. No lines, no waiting, more personal attention from winemakers.

### 3. Mustard Season Magic (February-March)
The valley transforms into a sea of yellow as mustard blooms between the dormant vines. It's one of Napa's most photogenic seasons.

### 4. Cozy Vibes
There's something magical about wine tasting when it's cool outside. Fireplaces, warm hospitality, and heated pools make winter special.

## What to Do in Winter Napa

- **Wine tasting** without the crowds
- **Spa experiences** at local resorts
- **Sauna sessions** at Hennessey Estate (perfect after cold-weather exploring)
- **Culinary classes** at CIA at Copia
- **Storm watching** from a cozy tasting room

## Winter Weather Reality

Yes, it rains. Average January/February sees 10-12 rainy days. But:
- Rain is often light and intermittent
- Many wineries have indoor tasting spaces
- Rainy day = perfect spa/pool/sauna day
- The pool at Hennessey Estate is heated year-round!

## Pack for Winter Napa

- Layers (mornings can be 40°F, afternoons 60°F)
- Rain jacket
- Comfortable waterproof shoes
- Swimsuit (yes, really—for the heated pool!)

*Ready to discover winter Napa? [Check availability at Hennessey Estate](/book)*
    `,
    image: 'https://static.wixstatic.com/media/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg/v1/fill/w_1200,h_630,q_90/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg',
    category: 'Seasonal',
    tags: ['Winter Travel', 'Off-Season', 'Mustard Season', 'Budget Travel'],
    author: 'Hennessey Estate',
    datePublished: '2026-01-02',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'romantic-napa-getaway-guide',
    title: 'Planning the Perfect Romantic Napa Getaway: A Couples Guide',
    excerpt: 'Everything you need to plan an unforgettable romantic escape to Napa Valley for anniversaries, proposals, or just because.',
    content: `
# Planning the Perfect Romantic Napa Getaway

Napa Valley might be the most romantic destination in California. World-class wine, amazing food, and a relaxed pace create the perfect backdrop for couples. Here's how to plan an unforgettable romantic escape.

## Why Napa for Romance

- Intimate tasting rooms designed for couples
- Farm-to-table dining experiences
- Spa and relaxation opportunities
- Beautiful scenery at every turn
- Adult-focused atmosphere

## Romantic Things to Do

### Experiences for Two
1. **Hot Air Balloon Ride** - Watch sunrise over the valley
2. **Couples Cooking Class** - CIA at Copia offers excellent options
3. **Private Wine Cave Tour** - Many wineries offer intimate experiences
4. **Sunset Picnic** - Pack wine and cheese for a vineyard view

### At Hennessey Estate
- Evening swim under the stars
- Sauna session for two
- Morning coffee in the Victorian gardens
- Wine hour in the historic tasting room

## Most Romantic Restaurants

1. **French Laundry** (if you can get a reservation)
2. **The Restaurant at Meadowood** 
3. **Angèle** - Riverside French romance
4. **Bistro Don Giovanni** - Classic Italian charm
5. **Bottega** - Michael Chiarello's Yountville gem

## Timing Your Trip

- **Valentine's Week** - Book 3+ months ahead
- **September-October** - Harvest magic
- **Weekdays** - More intimate experience
- **Winter** - Cozy, affordable, uncrowded

## Pro Tips for Couples

- Book a room with a tub (ask when reserving)
- Request restaurant tables in quiet corners
- Plan one spontaneous day with no agenda
- Share tasting flights instead of individual pours

*Planning a romantic escape? [Book Hennessey Estate](/book) and let us help make it special.*
    `,
    image: 'https://static.wixstatic.com/media/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg/v1/fill/w_1200,h_630,q_90/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg',
    category: 'Romance',
    tags: ['Romantic Getaway', 'Couples Travel', 'Anniversary', 'Valentine\'s Day'],
    author: 'Hennessey Estate',
    datePublished: '2025-12-28',
    readTime: '6 min read',
    featured: false,
  },
];

// Get unique categories
const getCategories = () => {
  const categories = blogPosts.map(post => post.category);
  return ['All', ...new Set(categories)];
};

// Blog List Component
export const BlogList = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = getCategories();

  // Set page meta
  usePageMeta({
    pageKey: 'blog',
    path: '/blog',
  });

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return blogPosts;
    return blogPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory]);

  // Featured posts
  const featuredPosts = blogPosts.filter(post => post.featured).slice(0, 3);

  return (
    <div className="blog-page">
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Header */}
      <header className="blog-header">
        <nav className="breadcrumbs">
          {breadcrumbs.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="separator">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className="current">{item.name}</span>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </span>
          ))}
        </nav>
        <h1>Napa Valley Travel Blog</h1>
        <p>Tips, guides & insider knowledge for your wine country adventure</p>
      </header>

      {/* Featured Posts */}
      <section className="featured-posts">
        <h2>Featured Articles</h2>
        <div className="featured-grid">
          {featuredPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="featured-card">
              <div className="featured-image">
                <img src={post.image} alt={post.title} loading="eager" />
                <span className="category-badge">{post.category}</span>
              </div>
              <div className="featured-content">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="read-time">{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <nav className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      {/* All Posts */}
      <section className="all-posts">
        <h2>All Articles</h2>
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="post-card">
              <div className="post-image">
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>
              <div className="post-content">
                <span className="post-category">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="post-meta">
                  <span>{post.datePublished}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="blog-newsletter">
        <h2>Get Napa Insider Tips</h2>
        <p>Subscribe to receive seasonal guides, special offers, and local recommendations.</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Your email address" />
          <button type="submit">Subscribe →</button>
        </form>
      </section>
    </div>
  );
};

// Blog Post Component
export const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  // Set page meta
  usePageMeta({
    title: post ? `${post.title} | Hennessey Estate Blog` : 'Post Not Found',
    description: post?.excerpt || '',
    image: post?.image,
    path: `/blog/${slug}`,
    type: 'article',
    article: post ? {
      publishedTime: post.datePublished,
      author: post.author,
      section: post.category,
      tags: post.tags,
    } : null,
  });

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post?.title || 'Post', path: `/blog/${slug}` },
  ];

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="post-not-found">
          <h1>Post Not Found</h1>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="back-link">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  // Related posts (same category, different post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="blog-post-page">
      <BreadcrumbSchema items={breadcrumbs} />
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        image={post.image}
        datePublished={post.datePublished}
        author={post.author}
        url={`https://hennesseyestate.com/blog/${post.slug}`}
      />

      {/* Hero */}
      <header className="post-hero" style={{ backgroundImage: `url(${post.image})` }}>
        <div className="post-hero-overlay"></div>
        <div className="post-hero-content">
          <nav className="breadcrumbs">
            {breadcrumbs.slice(0, 2).map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="separator">/</span>}
                <Link to={item.path}>{item.name}</Link>
              </span>
            ))}
          </nav>
          <span className="post-category">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>{post.datePublished}</span>
            <span>•</span>
            <span>{post.readTime}</span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="post-content">
        <div 
          className="post-body"
          dangerouslySetInnerHTML={{ 
            __html: post.content
              .replace(/^# .+$/gm, '') // Remove h1 (already in hero)
              .replace(/^## (.+)$/gm, '<h2>$1</h2>')
              .replace(/^### (.+)$/gm, '<h3>$1</h3>')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>')
              .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
              .replace(/^- (.+)$/gm, '<li>$1</li>')
              .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
              .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^(.+)$/gm, (match) => {
                if (match.startsWith('<')) return match;
                return `<p>${match}</p>`;
              })
          }}
        />

        {/* Tags */}
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {/* CTA */}
        <div className="post-cta">
          <h3>Plan Your Napa Valley Stay</h3>
          <p>Experience everything mentioned in this article and more at Hennessey Estate.</p>
          <Link to="/book" className="cta-button">Book Your Stay →</Link>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2>Related Articles</h2>
          <div className="related-grid">
            {relatedPosts.map((relPost) => (
              <Link key={relPost.slug} to={`/blog/${relPost.slug}`} className="related-card">
                <img src={relPost.image} alt={relPost.title} loading="lazy" />
                <h3>{relPost.title}</h3>
                <span>{relPost.readTime}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="back-to-blog">
        <Link to="/blog">← Back to All Articles</Link>
      </div>
    </div>
  );
};

export default BlogList;
