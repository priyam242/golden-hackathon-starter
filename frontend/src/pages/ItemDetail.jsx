import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@shared/api-client/client';
import { formatINR } from '@shared/utils/money';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Star, ShieldCheck, MapPin } from 'lucide-react';

export function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await apiClient(`/api/items/${id}`);
        setItem(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center font-bold text-gradient">Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Item Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/items')}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate('/items')}
        className="flex items-center gap-2 text-sm font-bold mb-6 hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-fg" />
        <span className="text-gradient">Back to Inventory</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-80 object-cover rounded-lg border border-line"
          />
          {item.location && (
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-fg-muted">
              <MapPin className="w-4 h-4" />
              <span>Ships from: {item.location.city} (Lat: {item.location.lat}, Lng: {item.location.lng})</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-2">
              {item.categoryName}
            </div>
            <h1 className="text-3xl font-bold mb-4">
              <span className="text-gradient">{item.title}</span>
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-gradient">{formatINR(item.price)}</span>
              <span className="text-xs px-2 py-0.5 rounded border border-line font-bold">
                ★ {item.rating} ({item.reviewsCount} reviews)
              </span>
            </div>
            <p className="text-sm text-gradient leading-relaxed mb-6">
              {item.description}
            </p>
          </div>

          <div className="pt-6 border-t border-line flex gap-4">
            <Button
              variant="primary"
              onClick={() => addToCart(item)}
              className="flex-1 py-3"
            >
              Add to Shopping Cart
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                addToCart(item);
                navigate('/cart');
              }}
              className="py-3"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

