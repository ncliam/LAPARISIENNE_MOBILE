import { Tabs } from "zmp-ui";
import OrderList from "./order-list";
import { ordersState } from "@/state";
import { useNavigate, useParams } from "react-router-dom";

function OrdersPage() {
  const { status } = useParams();
  const navigate = useNavigate();

  return (
    <Tabs
      className="h-full flex flex-col"
      activeKey={status}
      onChange={(status) => navigate(`/orders/${status}`)}
    >
      <Tabs.Tab key="pending" label="Đã xác nhận">
        <OrderList ordersState={ordersState(["pending"])} />
      </Tabs.Tab>
      <Tabs.Tab key="paid" label="Đã trả tiền">
        <OrderList ordersState={ordersState(["paid"])} />
      </Tabs.Tab>
      <Tabs.Tab key="completed" label="Hoàn thành">
        <OrderList ordersState={ordersState(["completed","cancelled"])} />
      </Tabs.Tab>
    </Tabs>
  );
}

export default OrdersPage;
