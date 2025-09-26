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
      <div className="text-sm">{props.detail || props.product.name}</div>
      <div className="text-sm font-bold mt-1">
        {formatPrice(props.unitprice || props.product.price)}
      </div>
    </List.Item>
  );
}

export default OrderItem;
