import React from 'react';
import { 
  Clock, 
  Shield, 
  Star, 
  HeadphonesIcon, 
  MessageCircle, 
  CreditCard 
} from 'lucide-react';

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

class BenefitItem extends React.Component<BenefitItemProps> {
  public render(): React.ReactNode {
    const { icon, title, description } = this.props;

    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    );
  }
}

export class BenefitsList extends React.Component {
  private readonly benefits = [
    {
      icon: <Clock className="w-4 h-4 text-primary-600" />,
      title: "Saves Time",
      description: "Professional cleaning while you focus on what matters most"
    },
    {
      icon: <Shield className="w-4 h-4 text-primary-600" />,
      title: "Safety First",
      description: "Bonded, insured, and background-checked professionals"
    },
    {
      icon: <Star className="w-4 h-4 text-primary-600" />,
      title: "Best Quality",
      description: "Consistent, thorough cleaning with attention to detail"
    },
    {
      icon: <HeadphonesIcon className="w-4 h-4 text-primary-600" />,
      title: "Easy to Get Help",
      description: "24/7 customer support for any questions or concerns"
    },
    {
      icon: <MessageCircle className="w-4 h-4 text-primary-600" />,
      title: "Seamless Communication",
      description: "Real-time updates and direct contact with your team"
    },
    {
      icon: <CreditCard className="w-4 h-4 text-primary-600" />,
      title: "Cash-Free Payment",
      description: "Secure online payment with automatic billing"
    }
  ];

  public render(): React.ReactNode {
    return (
      <div className="bg-white rounded-lg shadow-soft border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Why Choose Yeshua Cleaning?</h2>
        
        <div className="space-y-4">
          {this.benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>Insured</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>5-Star Rated</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-1" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
