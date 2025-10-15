import React from "react";
import "../css/OrderSteps.css";

type OrderStatus = "ToPay" | "ToShip" | "Shipping" | "Delivered";

interface Props {
  status: OrderStatus;
}

const OrderSteps: React.FC<Props> = ({ status }) => {
  const statusToStep: Record<OrderStatus, number> = {
    ToPay: 1,
    ToShip: 2,
    Shipping: 3,
    Delivered: 4,
  };

  const currentStep = statusToStep[status];
  const steps = ["To pay", "To ship", "Shipping", "Delivered"];

  return (
    <div className="steps-container">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        return (
          <div className="step-wrapper">
            <div
              className={`circle ${currentStep >= stepNumber ? "active" : ""}`}
            >
              {stepNumber}
            </div>

            <p className="step-label">{step}</p>

            {index < steps.length - 1 && (
              <div
                className={`line ${currentStep > stepNumber ? "active" : ""}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderSteps;
