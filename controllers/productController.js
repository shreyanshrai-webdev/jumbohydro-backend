const Product = require('../models/Product');

// Seed the 6 Jumbohydro products
exports.seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return res.json({ message: 'Products already seeded' });

    const products = [
      {
        name: 'Scuba Diving Weight Belt',
        description: 'The Scuba Diving Weight Belt is a professional-grade belt designed for underwater stability and comfort. It helps divers achieve neutral buoyancy by adding the right amount of weight. Features an adjustable fit with a quick-release buckle for emergency safety. Made from durable nylon webbing that is resistant to saltwater and wear. Ideal for recreational and professional divers in all underwater conditions. Suitable for scuba diving, snorkeling, and underwater photography. Always ensure correct weighting to prevent over- or under-weighting during dives.',
        price: { INR: 200, USD: 2.40, EUR: 2.20, GBP: 1.90 },
        category: 'Weight Belts',
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Zavorra.JPG',
        stock: 150
      },
      {
        name: 'Pocket Weight Belt',
        description: 'The Pocket Weight Belt features a modern design with removable weight pouches for precise ballast adjustment and optimal buoyancy control underwater. The pouches allow you to add or remove weight quickly without tools. Constructed from durable nylon with rust-proof stainless steel hardware for long-lasting use in marine environments. Ideal for divers who require customized weight distribution for comfort and stability. Suitable for scuba diving, freediving, and underwater work. Ensure weights are evenly distributed to maintain a horizontal position underwater.',
        price: { INR: 300, USD: 3.60, EUR: 3.30, GBP: 2.80 },
        category: 'Weight Belts',
        image: 'https://drardiving.com/wp-content/uploads/2024/07/71Hepsd9piL._AC_UF10001000_QL80_.jpg',
        stock: 120
      },
      {
        name: 'Freediving Rubber Weight Belt',
        description: 'The Freediving Rubber Weight Belt is specifically designed for freediving and spearfishing where flexibility and a secure fit are critical. Made from high-quality rubber that stretches with your body during breath-hold dives and stays securely in place without slipping. The hydrodynamic profile reduces drag underwater for faster, more efficient dives. Highly resistant to saltwater, UV exposure, and wear ensuring long durability. Compatible with standard weight blocks and pouches. Used by competitive freedivers and spearfishers worldwide for its reliability and comfort.',
        price: { INR: 400, USD: 4.80, EUR: 4.40, GBP: 3.75 },
        category: 'Weight Belts',
        image: 'https://www.lostwinds.com/cdn/shop/collections/spear-pro-marseilles-weight-belt_37d14687-54c0-45c1-a464-84bc2384dd82.jpg?v=1573586294&width=1280',
        stock: 100
      },
      {
        name: 'Underwater Exothermic Cutting Torch',
        description: 'The Underwater Exothermic Cutting Torch is a powerful industrial tool used by professional divers to cut metals underwater. It works by supplying oxygen to a specially designed cutting rod, generating extremely high temperatures capable of cutting through steel, cast iron, and other hard materials efficiently even at depth. Operates effectively at depths up to 200 meters making it ideal for marine salvage, offshore oil and gas construction, ship repair, and underwater demolition. The torch is built for reliability in the harshest underwater environments. This equipment should only be used by trained professionals with proper safety gear, as it produces extremely high temperatures and requires a controlled oxygen supply.',
        price: { INR: 1000, USD: 12.00, EUR: 11.00, GBP: 9.50 },
        category: 'Cutting Equipment',
        image: 'https://i0.wp.com/www.broco-rankin.com/wp-content/uploads/2022/11/br22_plus_02_1600x900.jpg?resize=1536%2C864&ssl=1',
        stock: 50
      },
      {
        name: 'BROCO Prime-Cut Ultrathermic Cutting Rods',
        description: 'BROCO Prime-Cut Ultrathermic Cutting Rods are specially engineered for extreme cutting applications including underwater environments. These rods generate intense heat through a powerful exothermic reaction, allowing efficient cutting of metals, concrete, reinforced steel, and other tough materials. The self-oxidizing design ensures reliable ignition and a sustained burn even when fully submerged underwater. Compatible with all BROCO torch systems and standard underwater cutting equipment. Used extensively in marine salvage operations, offshore construction, military diving, and underwater pipeline work. These cutting rods should only be used by trained professionals. Proper safety gear and controlled oxygen supply are essential due to the extremely high temperatures generated during operation.',
        price: { INR: 800, USD: 9.60, EUR: 8.80, GBP: 7.50 },
        category: 'Cutting Equipment',
        image: 'https://i0.wp.com/www.broco-rankin.com/wp-content/uploads/2023/01/UW-Cutting-Rods400x400.jpg?w=400&ssl=1',
        stock: 200
      },
      {
        name: 'BROCO Underwater Cutting Torch (Stinger)',
        description: 'The BROCO Underwater Cutting Torch, also known as the Stinger, is a specialized compact tool designed for professional divers to perform precision cutting operations in underwater environments. It delivers oxygen to cutting rods enabling an exothermic reaction that produces extremely high heat for efficient cutting of metals, pipelines, ship hulls, and structural steel. The lightweight ergonomic design allows divers to work comfortably even in confined underwater spaces. Widely used by military combat divers, commercial salvage teams, offshore oil and gas contractors, and underwater construction crews worldwide. The Stinger is trusted for its reliability, performance, and ease of use in the most demanding underwater conditions. Only trained professionals with appropriate safety equipment and oxygen supply systems should operate this torch.',
        price: { INR: 1200, USD: 14.40, EUR: 13.20, GBP: 11.30 },
        category: 'Cutting Equipment',
        image: 'https://i0.wp.com/www.broco-rankin.com/wp-content/uploads/2022/11/Stinger20_800x600.jpg?w=800&ssl=1',
        stock: 60
      }
    ];

    await Product.insertMany(products);
    res.status(201).json({ message: '6 products seeded successfully', count: products.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { 'price.INR': 1 };
    if (sort === 'price_desc') sortObj = { 'price.INR': -1 };
    if (sort === 'rating') sortObj = { 'ratings.average': -1 };

    const products = await Product.find(query).sort(sortObj);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
