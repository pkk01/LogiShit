import { CheckCircle, Clock, MapPin, Truck } from 'lucide-react';
import React from 'react';
import { formatDate } from '../utils/dateFormat';

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  icon: React.ReactNode;
}

interface Props {
  currentStatus: string;
  pickupDate?: string;
  deliveryDate?: string;
}

const DeliveryStatusTimeline: React.FC<Props> = ({ currentStatus, pickupDate, deliveryDate }) => {
  const statusMap: { [key: string]: TimelineStep[] } = {
    'Pending': [
      { label: 'Order Placed', status: 'current', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Scheduled Pickup', status: 'pending', icon: <MapPin className="w-5 h-5" /> },
      { label: 'In Transit', status: 'pending', icon: <Truck className="w-5 h-5" /> },
      { label: 'Out for Delivery', status: 'pending', icon: <Truck className="w-5 h-5" /> },
      { label: 'Delivered', status: 'pending', icon: <CheckCircle className="w-5 h-5" /> },
    ],
    'Scheduled': [
      { label: 'Order Placed', status: 'completed', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Scheduled Pickup', status: 'current', icon: <MapPin className="w-5 h-5" /> },
      { label: 'In Transit', status: 'pending', icon: <Truck className="w-5 h-5" /> },
      { label: 'Out for Delivery', status: 'pending', icon: <Truck className="w-5 h-5" /> },
      { label: 'Delivered', status: 'pending', icon: <CheckCircle className="w-5 h-5" /> },
    ],
    'Picked Up': [
      { label: 'Order Placed', status: 'completed', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Scheduled Pickup', status: 'completed', icon: <MapPin className="w-5 h-5" /> },
      { label: 'In Transit', status: 'current', icon: <Truck className="w-5 h-5" /> },
      { label: 'Out for Delivery', status: 'pending', icon: <Truck className="w-5 h-5" /> },
      { label: 'Delivered', status: 'pending', icon: <CheckCircle className="w-5 h-5" /> },
    ],
    'In Transit': [
      { label: 'Order Placed', status: 'completed', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Scheduled Pickup', status: 'completed', icon: <MapPin className="w-5 h-5" /> },
      { label: 'In Transit', status: 'completed', icon: <Truck className="w-5 h-5" /> },
      { label: 'Out for Delivery', status: 'current', icon: <Truck className="w-5 h-5" /> },
      { label: 'Delivered', status: 'pending', icon: <CheckCircle className="w-5 h-5" /> },
    ],
    'Out for Delivery': [
      { label: 'Order Placed', status: 'completed', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Scheduled Pickup', status: 'completed', icon: <MapPin className="w-5 h-5" /> },
      { label: 'In Transit', status: 'completed', icon: <Truck className="w-5 h-5" /> },
      { label: 'Out for Delivery', status: 'current', icon: <Truck className="w-5 h-5" /> },
      { label: 'Delivered', status: 'pending', icon: <CheckCircle className="w-5 h-5" /> },
    ],
    'Delivered': [
      { label: 'Order Placed', status: 'completed', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Scheduled Pickup', status: 'completed', icon: <MapPin className="w-5 h-5" /> },
      { label: 'In Transit', status: 'completed', icon: <Truck className="w-5 h-5" /> },
      { label: 'Out for Delivery', status: 'completed', icon: <Truck className="w-5 h-5" /> },
      { label: 'Delivered', status: 'completed', timestamp: deliveryDate, icon: <CheckCircle className="w-5 h-5" /> },
    ],
    'Cancelled': [
      { label: 'Order Placed', status: 'completed', timestamp: pickupDate, icon: <Clock className="w-5 h-5" /> },
      { label: 'Cancelled', status: 'completed', icon: <Clock className="w-5 h-5" /> },
    ],
  };

  const steps = statusMap[currentStatus] || statusMap['Pending'];

  return (
    <div className="w-full bg-gradient-to-br from-surface to-gray-50 rounded-lg p-3 border border-gray-200 shadow">
      <h3 className="text-base font-bold text-textPrimary mb-3 flex items-center gap-1.5">
        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
          <Truck className="w-4 h-4 text-primary" />
        </div>
        Delivery Progress
      </h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 rounded-full" style={{ zIndex: 0 }} />
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-success to-secondary rounded-full transition-all duration-1000"
          style={{
            width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`,
            zIndex: 1
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between" style={{ zIndex: 2 }}>
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center" style={{ flex: 1 }}>
              {/* Circle with Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-500 transform ${
                  step.status === 'completed'
                    ? 'bg-gradient-to-br from-success to-secondary shadow shadow-success/30 scale-105'
                    : step.status === 'current'
                    ? 'bg-gradient-to-br from-primary to-blue-600 shadow shadow-primary/30 scale-105 animate-pulse'
                    : 'bg-gray-200 scale-100'
                }`}
              >
                <div className={
                  step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-gray-400'
                }>
                  {step.icon}
                </div>
              </div>

              {/* Label */}
              <p
                className={`text-[11px] font-semibold text-center mb-0.5 transition-all ${
                  step.status === 'completed'
                    ? 'text-success'
                    : step.status === 'current'
                    ? 'text-primary'
                    : 'text-textSecondary'
                }`}
              >
                {step.label}
              </p>

              {/* Timestamp */}
              {step.timestamp && (
                <p className="text-[10px] text-textSecondary font-medium px-2 py-0.5 bg-white rounded-full border border-gray-200 mt-0.5">
                  {formatDate(step.timestamp)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatusTimeline;
