const pool = require('../config/db');

class Product {
  // Get all products with optional filters
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.location) {
      query += ' AND location = ?';
      params.push(filters.location);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const [products] = await pool.execute(query, params);
    
    // Parse JSON images field
    return products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));
  }

  // Get product by ID
  static async findById(id) {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) return null;
    
    const product = products[0];
    return {
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    };
  }

  // Get product by SKU
  static async findBySku(sku) {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE sku = ?',
      [sku]
    );
    
    if (products.length === 0) return null;
    
    const product = products[0];
    return {
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    };
  }

  // Create product
  static async create(productData) {
    const { sku, name, description, price, category, location = 'USA', stock = 0, images = [] } = productData;
    
    const [result] = await pool.execute(
      `INSERT INTO products (sku, name, description, price, category, location, stock, images) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, description || null, price, category || null, location, stock, JSON.stringify(images)]
    );

    return this.findById(result.insertId);
  }

  // Update product
  static async update(id, productData) {
    const { name, description, price, category, location, stock, images } = productData;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      values.push(stock);
    }
    if (images !== undefined) {
      updates.push('images = ?');
      values.push(JSON.stringify(images));
    }

    if (updates.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete product
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Product;
