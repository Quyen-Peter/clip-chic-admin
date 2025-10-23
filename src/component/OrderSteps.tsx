import React from "react";
import "../css/OrderSteps.css";

type OrderStatus =
  | "pending"
  | "payment"
  | "processing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "failed"
  | "refunded"
  | "returned";

interface Props {
  status: OrderStatus;
}

const OrderSteps: React.FC<Props> = ({ status }) => {
  const statusToStep: Record<OrderStatus, number> = {
    pending: 1,
    payment: 1,
    processing: 2,
    shipping: 3,
    delivered: 4,
    cancelled: 4,
    failed: 4,
    refunded: 4,
    returned: 4,
  };

  const currentStep = statusToStep[status];
  const steps = [
    "Đang chờ xử lý",
    "Đang chờ giao hàng",
    "Đang giao hàng",
    status === "delivered"
      ? "Thành công"
      : ["cancelled", "failed", "refunded", "returned"].includes(status)
      ? "Đã hủy / Trả hàng"
      : "Hoàn tất",
  ];

  return (
    <div className="steps-container">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCancelled = [
          "cancelled",
          "failed",
          "refunded",
          "returned",
        ].includes(status);
        return (
          <div key={index} className="step-wrapper">
            <div
              className={`circle ${
                isCancelled && stepNumber === 4
                  ? "cancelled"
                  : currentStep >= stepNumber
                  ? "active"
                  : ""
              }`}
            >
              {stepNumber}
            </div>

            <p
              className={`step-label ${
                isCancelled && stepNumber === 4 ? "cancelled-text" : ""
              }`}
            >
              {step}
            </p>

            {index < steps.length - 1 && (
              <div
                className={`line ${
                  currentStep > stepNumber
                    ? isCancelled
                      ? "cancelled-line"
                      : "active"
                    : ""
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderSteps;
