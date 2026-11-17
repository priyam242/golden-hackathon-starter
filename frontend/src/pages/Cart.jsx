import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatINR } from '@shared/utils/money';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';

export function Cart() {
  const { cart, addToCart, removeFromCart, clearCart } = useStore();
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discountAmount;
  const tax = Math.round(taxable * 0.18);
  const total = taxable + tax;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'HACKATHON2026') {
      setDiscountPercent(25);
      setCouponMsg('Coupon applied! 25% discount activated.');
    } else if (coupon.trim().toUpperCase() === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponMsg('Coupon applied! 10% discount activated.');
    } else {
      setDiscountPercent(0);
      setCouponMsg('Invalid or expired coupon code.');
    }
  };

  const handleCheckout = () => {
    setIsSuccess(true);
    clearCart();
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <Card className="p-10 flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-fg mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-gradient">Order Placed Successfully!</h2>
          <p className="text-sm text-gradient mb-6">
            Your hackathon demo order #ORD-{Math.floor(1000 + Math.random() * 9000)} has been processed offline via Mock Engine.
          </p>
          <Button variant="primary" onClick={() => navigate('/items')}>
            Return to Inventory
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">
        <span className="text-gradient">Your Shopping Cart</span>
      </h1>

      {cart.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-lg font-bold mb-2 text-gradient">Your cart is currently empty</p>
          <p className="text-sm text-fg-muted mb-6">Explore the developer inventory and add items to your cart.</p>
          <Button variant="primary" onClick={() => navigate('/items')}>
            Browse Inventory
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Item Rows */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {cart.map((item) => (
              <Card key={item.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded border border-line" />
                  <div>
                    <h4 className="font-bold text-sm text-gradient">{item.title}</h4>
                    <div className="text-xs text-fg-muted font-bold mt-1">
                      {formatINR(item.price)} each
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center border border-line rounded">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          useStore.setState({
                            cart: cart.map((c) =>
                              c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c
                            ),
                          });
                        } else {
                          removeFromCart(item.id);
                        }
                      }}
                      className="px-2 py-1 text-xs hover:bg-surface-2"
                    >
                      <Minus className="w-3 h-3 text-fg" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gradient">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-2 py-1 text-xs hover:bg-surface-2"
                    >
                      <Plus className="w-3 h-3 text-fg" />
                    </button>
                  </div>

                  <div className="font-bold text-sm text-gradient w-24 text-right">
                    {formatINR(item.price * item.quantity)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-fg hover:opacity-75"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary & Coupon */}
          <div>
            <Card>
              <h3 className="text-xl font-bold mb-4 text-gradient">Summary</h3>

              <div className="flex flex-col gap-2.5 text-sm mb-6 divide-y divide-line">
                <div className="flex justify-between pt-2">
                  <span className="text-fg-muted font-bold">Subtotal</span>
                  <span className="font-bold text-gradient">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between pt-2 font-bold">
                    <span className="text-fg-muted">Discount ({discountPercent}%)</span>
                    <span className="text-gradient">- {formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-fg-muted font-bold">Estimated GST (18%)</span>
                  <span className="font-bold text-gradient">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between pt-3 text-lg font-bold">
                  <span className="text-gradient">Total</span>
                  <span className="text-gradient">{formatINR(total)}</span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-3">
                <Input
                  placeholder="Coupon Code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="text-xs"
                />
                <Button type="submit" variant="secondary" className="text-xs px-3">
                  Apply
                </Button>
              </form>
              {couponMsg && (
                <div className="text-xs font-bold mb-4 text-gradient">
                  {couponMsg}
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleCheckout}
                className="w-full py-3 mt-2"
              >
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

