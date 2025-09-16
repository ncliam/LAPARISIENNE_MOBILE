import { HomeIcon, LocationMarkerLineIcon } from "@/components/vectors";
import { Order } from "@/types";
import { Icon, List } from "zmp-ui";
import DeliverySummary from "../cart/delivery-summary";

function OrderInfo(props: { order: Order }) {
  return (
    <List noSpacing className="bg-section rounded-lg">
      <DeliverySummary
          icon={<HomeIcon />}
          title={props.order.shop_order_no || 'Cửa hàng'} 
          subtitle={props.order.station?.name}
          description={props.order.station?.address}
        />
      {props.order.delivery.type === "shipping" ? (
        <DeliverySummary
          icon={<LocationMarkerLineIcon />}
          title="Giao đến"
          subtitle={props.order.delivery.alias}
          description={props.order.delivery.address}
        />
      ) : (
        <div/>
      )}
      {props.order.note && (
        <List.Item prefix={<Icon icon="zi-note" />} title="Ghi chú">
          <span className="text-xs text-inactive">{props.order.note}</span>
        </List.Item>
      )}
    </List>
  );
}

export default OrderInfo;
