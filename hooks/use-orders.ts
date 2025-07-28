import { useState, useEffect } from 'react';
import { orders as mockOrders } from '@/lib/mock-data';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  order_date: string;
  delivery_date?: string;
  delivery_address?: any;
  payment_method?: string;
  orderedBy?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: any;
  };
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  items: Array<{
    product_id: string;
    product_name?: string;
    product_image?: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
}

export function useOrders(userId?: string) {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get orders from localStorage first
        let allOrders: Order[] = [];

        if (typeof window !== 'undefined') {
          const storedOrders = localStorage.getItem('user_orders');
          if (storedOrders) {
            allOrders = JSON.parse(storedOrders);
          }
        }

        // Fallback to mock data if no stored orders
        if (allOrders.length === 0) {
          allOrders = [];
        }

        let filteredOrders = allOrders;

        if (userId) {
          filteredOrders = filteredOrders.filter(order => order.user_id === userId);
        }

        setData(filteredOrders);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err instanceof Error ? err : new Error('Failed to load orders'));
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  return {
    orders: data,
    isLoading,
    isError: !!error,
    error
  };
}

// Orders mock data
export const ordersData = [
  {
    id: "order-1",
    user_id: "user-1",
    customer_name: "John Doe",
    customer_email: "john.doe@example.com",
    customer_phone: "+91 9876543210",
    total_amount: 5298.00,
    status: "delivered",
    order_date: "2025-06-20T10:30:00.000Z",
    delivery_date: "2025-06-25T14:00:00.000Z",
    delivery_address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    tracking_id: "TRK123456789",
    orderedBy: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      address: {
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      }
    },
    items: [
      {
        product_id: "088a3c22-097c-4e76-963a-108dd2d3068e",
        product_name: "Traditional Women Dress",
        product_image: "/half saree.jpg",
        quantity: 2,
        price: 2799.00,
        seller_id: "rohit@gmail.com"
      }
    ]
  },
  {
    id: "order-2",
    user_id: "user-1",
    customer_name: "John Doe",
    customer_email: "john.doe@example.com",
    customer_phone: "+91 9876543210",
    total_amount: 1599.00,
    status: "confirmed",
    order_date: "2025-07-01T15:45:00.000Z",
    delivery_address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    orderedBy: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      address: {
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      }
    },
    items: [
      {
        product_id: "b88a3c22-097c-4e76-963a-108dd2d3068f",
        product_name: "Traditional Men Dress",
        product_image: "/mentradition.jpg",
        quantity: 1,
        price: 1599.00,
        seller_id: "rohit@gmail.com"
      }
    ]
  },
  {
    id: "order-3",
    user_id: "user-1",
    customer_name: "Jane Smith",
    customer_email: "jane.smith@example.com",
    customer_phone: "+91 9876543211",
    total_amount: 8999.00,
    status: "shipped",
    order_date: "2025-07-02T10:15:00.000Z",
    delivery_address: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001"
    },
    tracking_id: "TRK987654321",
    orderedBy: {
      id: "user-1",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 9876543211",
      address: {
        street: "456 Park Avenue",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001"
      }
    },
    items: [
      {
        product_id: "c88a3c22-097c-4e76-963a-108dd2d3068g",
        product_name: "Luxury Leather Handbag",
        product_image: "/handbag.jpeg",
        quantity: 1,
        price: 8999.00,
        seller_id: "rohit@gmail.com"
      }
    ]
  }
];