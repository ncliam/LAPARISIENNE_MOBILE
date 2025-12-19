import { CartItem } from "@/types";
import { formatPrice } from "@/utils/format";
import { List, Icon } from "zmp-ui";
import {
  PackageDeliveryIcon
} from "@/components/vectors";

function OrderItem(props: CartItem) {
  return (
    <List.Item
      prefix={
        <img src={props.product.image} className="w-14 h-14 rounded-lg" />
      }
      suffix={
        <div className="text-sm font-medium flex items-center h-full">
          x{props.quantity}
        </div>
      }
    >
      <div className="space-y-1">
        <div className="text-sm">{props.product.name}</div>
        {props.comboSelections?.length ? (
          <div className="space-y-1 text-3xs text-subtitle">
            {props.comboSelections.map((combo, index) => (
              <div
                className="flex items-center justify-between"
                key={`${combo.id}-${index}`}
              >
                <span className="pr-2">{combo.name}</span>
                <div className="flex items-center space-x-2">
                  {combo.extra_price > 0 ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      + {formatPrice(combo.extra_price)}
                    </span>
                  ) : (
                    <span className="text-line"></span>
                  )}
                  <span className="text-primary font-medium">x1</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {props.detail && (
          <div className="text-3xs text-subtitle">
            Ghi chú: {props.detail}
          </div>
        )}
        <div className="text-sm font-bold">
          {formatPrice(props.unitprice || props.product.price)}
        </div>
      </div>
    </List.Item>
  );
}

export default OrderItem;
