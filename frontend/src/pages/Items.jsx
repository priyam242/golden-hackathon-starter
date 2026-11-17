import React, { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client/client';
import { formatINR } from '@shared/utils/money';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, selectedCat, sort]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient('/api/categories');
      setCategories(res.data || []);
    } catch (e) {}
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (selectedCat) query.set('category', selectedCat);
      if (sort) query.set('sort', sort);

      const res = await apiClient(`/api/items?${query.toString()}`);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="items-page" className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-line gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Arsenal Inventory Catalog</span>
          </h1>
          <p className="text-sm mt-1 text-gradient">
            Explore hardware, tools, and developer assets with instant pagination and filtering.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            data-testid="view-toggle-grid"
            className={`p-2 rounded border transition-colors cursor-pointer ${
              view === 'grid' ? 'border-line-strong bg-surface-2' : 'border-line'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-fg" />
          </button>
          <button
            onClick={() => setView('table')}
            data-testid="view-toggle-table"
            className={`p-2 rounded border transition-colors cursor-pointer ${
              view === 'table' ? 'border-line-strong bg-surface-2' : 'border-line'
            }`}
          >
            <List className="w-4 h-4 text-fg" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search by title, tag, or description..."
          data-testid="items-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3.5 py-2.5 rounded bg-surface border border-line text-fg font-body focus:border-line-strong focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3.5 py-2.5 rounded bg-surface border border-line text-fg font-body focus:border-line-strong focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center font-bold text-gradient">
          Synchronizing items catalog...
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-lg font-bold mb-2 text-gradient">No items found</p>
          <p className="text-sm text-fg-muted mb-4">Try adjusting your search criteria or category filter.</p>
          <Button variant="secondary" onClick={() => { setSearch(''); setSelectedCat(''); }}>
            Reset Filters
          </Button>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              data-testid="item-card"
              className="flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-44 object-cover rounded mb-4 border border-line"
                  loading="lazy"
                />
                <div className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-1">
                  {item.categoryName}
                </div>
                <h3 className="text-lg font-bold mb-2 leading-snug">
                  <Link to={`/items/${item.id}`} data-testid="item-title" className="hover:underline">
                    <span className="text-gradient">{item.title}</span>
                  </Link>
                </h3>
                <p className="text-xs text-gradient line-clamp-2 mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-line flex items-center justify-between">
                <div data-testid="item-price" className="text-lg font-bold text-gradient">
                  {formatINR(item.price)}
                </div>
                <Button
                  variant="primary"
                  onClick={() => addToCart(item)}
                  className="text-xs px-3 py-1.5"
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto border border-line rounded-lg bg-surface">
          <table className="w-full text-left text-sm divide-y divide-line">
            <thead className="bg-surface-2 font-bold uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id} data-testid="item-card" className="hover:bg-bg-subtle transition-colors">
                  <td className="py-3 px-4 font-bold">
                    <Link to={`/items/${item.id}`} data-testid="item-title" className="hover:underline">
                      <span className="text-gradient">{item.title}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gradient">{item.categoryName}</td>
                  <td className="py-3 px-4 font-bold" data-testid="item-price">
                    <span className="text-gradient">{formatINR(item.price)}</span>
                  </td>
                  <td className="py-3 px-4 text-gradient">★ {item.rating}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="primary"
                      onClick={() => addToCart(item)}
                      className="text-xs px-3 py-1"
                    >
                      Add
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

