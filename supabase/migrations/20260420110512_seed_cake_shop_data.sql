
/*
  # Seed Cake Shop Data

  Inserts sample categories and cake products for demonstration purposes.
  All images are from Pexels (publicly accessible URLs).
*/

INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Birthday Cakes', 'birthday', 'Celebrate every milestone with our stunning birthday cakes', 'https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg'),
  ('c1000000-0000-0000-0000-000000000002', 'Wedding Cakes', 'wedding', 'Elegant tiered masterpieces for your perfect wedding day', 'https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg'),
  ('c1000000-0000-0000-0000-000000000003', 'Custom Cakes', 'custom', 'Bespoke creations tailored to your vision and taste', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'),
  ('c1000000-0000-0000-0000-000000000004', 'Cupcakes', 'cupcakes', 'Delightful bite-sized treats for every occasion', 'https://images.pexels.com/photos/1998635/pexels-photo-1998635.jpeg'),
  ('c1000000-0000-0000-0000-000000000005', 'Cheesecakes', 'cheesecakes', 'Rich, creamy cheesecakes with indulgent toppings', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'),
  ('c1000000-0000-0000-0000-000000000006', 'Seasonal Specials', 'seasonal', 'Limited edition cakes inspired by the season', 'https://images.pexels.com/photos/3065971/pexels-photo-3065971.jpeg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cakes (id, name, slug, description, price, category_id, image_url, images, weight_options, flavors, is_available, is_featured, tags) VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Classic Red Velvet Dream',
    'classic-red-velvet-dream',
    'Our signature red velvet cake layered with velvety cream cheese frosting. Each bite is a perfect balance of subtle cocoa flavor and tangy sweetness. A timeless classic that never disappoints.',
    1299,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    ARRAY['https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg', 'https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg'],
    '[{"weight":"500g","price":1299},{"weight":"1kg","price":2199},{"weight":"1.5kg","price":2999},{"weight":"2kg","price":3799}]',
    ARRAY['Classic Red Velvet', 'Dark Chocolate', 'Vanilla Bean'],
    true, true,
    ARRAY['bestseller', 'popular', 'signature']
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Grand Floral Wedding Tier',
    'grand-floral-wedding-tier',
    'A breathtaking three-tier masterpiece adorned with hand-crafted sugar flowers. Perfect for weddings, anniversaries, and grand celebrations. Customizable flavors for each tier.',
    8999,
    'c1000000-0000-0000-0000-000000000002',
    'https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg',
    ARRAY['https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg'],
    '[{"weight":"3kg (3-tier)","price":8999},{"weight":"5kg (3-tier)","price":13999},{"weight":"8kg (4-tier)","price":19999}]',
    ARRAY['Vanilla Bean', 'Strawberry Rose', 'Lemon Elderflower', 'Champagne'],
    true, true,
    ARRAY['wedding', 'premium', 'custom']
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Chocolate Truffle Indulgence',
    'chocolate-truffle-indulgence',
    'For the true chocolate lover. Rich Belgian chocolate ganache layered between moist chocolate sponge, topped with glossy dark chocolate drip and artisan chocolate truffles.',
    1499,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.pexels.com/photos/3026805/pexels-photo-3026805.jpeg',
    ARRAY['https://images.pexels.com/photos/3026805/pexels-photo-3026805.jpeg', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'],
    '[{"weight":"500g","price":1499},{"weight":"1kg","price":2699},{"weight":"1.5kg","price":3499},{"weight":"2kg","price":4299}]',
    ARRAY['Dark Chocolate', 'Milk Chocolate', 'White Chocolate', 'Hazelnut'],
    true, true,
    ARRAY['bestseller', 'chocolate-lover', 'indulgent']
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Rainbow Surprise Birthday',
    'rainbow-surprise-birthday',
    'A vibrant multi-layer rainbow cake that reveals a burst of colors when sliced. Filled with fluffy vanilla buttercream, this show-stopper is perfect for making birthdays unforgettable.',
    1799,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg',
    ARRAY['https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg'],
    '[{"weight":"1kg","price":1799},{"weight":"1.5kg","price":2499},{"weight":"2kg","price":3199}]',
    ARRAY['Vanilla', 'Strawberry', 'Lemon'],
    true, true,
    ARRAY['birthday', 'colorful', 'kids']
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Artisan Strawberry Cheesecake',
    'artisan-strawberry-cheesecake',
    'New York-style baked cheesecake on a buttery graham cracker crust, crowned with fresh strawberry compote and glazed whole strawberries. Creamy perfection in every slice.',
    1199,
    'c1000000-0000-0000-0000-000000000005',
    'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    ARRAY['https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'],
    '[{"weight":"500g","price":1199},{"weight":"1kg","price":2099},{"weight":"1.5kg","price":2899}]',
    ARRAY['Classic New York', 'Strawberry', 'Blueberry', 'Mango'],
    true, false,
    ARRAY['cheesecake', 'fruity', 'creamy']
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'Pastel Butterfly Custom Cake',
    'pastel-butterfly-custom-cake',
    'A whimsical custom creation featuring hand-painted butterfly motifs in soft pastels. Our artisans craft each detail to perfection. Available with personalized messages and custom toppers.',
    2299,
    'c1000000-0000-0000-0000-000000000003',
    'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
    ARRAY['https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'],
    '[{"weight":"1kg","price":2299},{"weight":"1.5kg","price":3099},{"weight":"2kg","price":3999}]',
    ARRAY['Vanilla Almond', 'Rose Lychee', 'Lavender Honey'],
    true, true,
    ARRAY['custom', 'art', 'premium', 'girls']
  ),
  (
    'a1000000-0000-0000-0000-000000000007',
    'Salted Caramel Drip Cake',
    'salted-caramel-drip-cake',
    'A decadent caramel sponge soaked with caramel sauce, layered with salted caramel buttercream, and finished with a luscious caramel drip and gold flakes. Pure luxury.',
    1649,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.pexels.com/photos/1998635/pexels-photo-1998635.jpeg',
    ARRAY['https://images.pexels.com/photos/1998635/pexels-photo-1998635.jpeg'],
    '[{"weight":"500g","price":1649},{"weight":"1kg","price":2849},{"weight":"1.5kg","price":3749}]',
    ARRAY['Salted Caramel', 'Butterscotch', 'Toffee'],
    true, false,
    ARRAY['caramel', 'drip', 'premium']
  ),
  (
    'a1000000-0000-0000-0000-000000000008',
    'Lemon Blueberry Fusion',
    'lemon-blueberry-fusion',
    'A bright and refreshing lemon sponge infused with fresh blueberry compote, frosted with tangy lemon cream cheese. The perfect summer celebration cake.',
    1349,
    'c1000000-0000-0000-0000-000000000006',
    'https://images.pexels.com/photos/3065971/pexels-photo-3065971.jpeg',
    ARRAY['https://images.pexels.com/photos/3065971/pexels-photo-3065971.jpeg'],
    '[{"weight":"500g","price":1349},{"weight":"1kg","price":2299},{"weight":"1.5kg","price":3099}]',
    ARRAY['Lemon Blueberry', 'Lemon Raspberry', 'Lemon Poppy Seed'],
    true, false,
    ARRAY['seasonal', 'fruity', 'fresh']
  )
ON CONFLICT (id) DO NOTHING;
